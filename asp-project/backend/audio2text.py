import io
import multiprocessing
import subprocess
import tempfile
import time
import warnings
warnings.filterwarnings('ignore')
import librosa
import os
import sys
import stat
import audioop
import wave
import math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import path_utils
from misc import whisper
import argparse
import pysrt
import six

class WhisperRecogniser:
    def __init__(self):
        self.model_path = path_utils.get_model_path()
        self.model = whisper.load_model(self.model_path)

    def __call__(self, audio_data):
        audio_data = whisper.pad_or_trim(audio_data)
        mel = whisper.log_mel_spectrogram(audio_data).to(self.model.device)

        # Detect language in audio
        _, probs = self.model.detect_language(mel)

        transcription = whisper.decode(self.model, mel, whisper.DecodingOptions(fp16=False))
        return transcription.text, max(probs, key=probs.get)

class ConvertFLAC: 
    def __init__(self, path):
        self.path = path

    def __call__(self, region):
        start_point, end_point = region

        # Adjust start and end times based on include_before and include_after
        start_point = max(0, start_point - 0.3)
        end_point += 0.3

        # Create a temporary FLAC file
        temporary_file = tempfile.NamedTemporaryFile(suffix='.flac', delete=False)

        ffmpeg_command = [
            path_utils.FFMPEG_PATH, "-ss", str(start_point), "-t", str(end_point - start_point),
            "-y", "-i", self.path,
            "-loglevel", "error", temporary_file.name
        ]

        # On windows
        subprocess.check_output(ffmpeg_command, stdin=open(os.devnull), shell=True)

        read_data = temporary_file.read()

        temporary_file.close()
        os.unlink(temporary_file.name)
        
        return read_data


class Audio2Subtitle:

    def __init__(self, filename, folder):
        self.filename = filename
        self.process_finished = False
        self.folder = folder

    def format_srt_subtitles1(self, subtitles):
        srt_file = pysrt.SubRipFile()

        for index, subtitle_data in enumerate(subtitles, start=1):
            (start_time, end_time), text = subtitle_data
            subtitle_item = pysrt.SubRipItem()
            subtitle_item.index = index
            subtitle_item.text = six.text_type(text)
            subtitle_item.start.seconds = max(0, start_time)
            subtitle_item.end.seconds = end_time
            srt_file.append(subtitle_item)

        formatted_srt = '\n'.join(six.text_type(item) for item in srt_file)
        return formatted_srt
    
    def format_srt_subtitles(self, subtitles):
        srt_file = ''

        for _, subtitle_data in enumerate(subtitles, start=1):
            (start_time, end_time), text = subtitle_data
            srt_file += f"[{start_time:.2f}->{end_time:.2f}] {text}\n"

        return srt_file
    
    def transform_audio(self):
        temp = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
        if not os.path.isfile(self.filename):
            print("Not found {}".format(self.filename))
        command = [path_utils.FFMPEG_PATH, "-y", "-i", self.filename,
                   "-ac", '1', "-ar", str(16000),
                   "-loglevel", "error", temp.name]
        # Only work on Windows
        subprocess.check_output(command, stdin=open(os.devnull), shell=True)
        return temp.name

    @staticmethod
    def calculate_percentile(arr, percentile_value):
        sorted_arr = sorted(arr)
        index = (len(sorted_arr) - 1) * percentile_value
        floor_index = math.floor(index)
        ceil_index = math.ceil(index)
        if floor_index == ceil_index:
            return sorted_arr[int(index)]
        lower_value = sorted_arr[int(floor_index)] * (ceil_index - index)
        upper_value = sorted_arr[int(ceil_index)] * (index - floor_index)
        
        return lower_value + upper_value

    def regions_dividing(self, filename):
        frame_width=4096
        min_size = 0.5
        max_size = 6
        reader = wave.open(filename)
        sample_width = reader.getsampwidth()
        rate = reader.getframerate()
        n_channels = reader.getnchannels()
        chunk_duration = float(frame_width) / rate

        n_chunks = int(math.ceil(reader.getnframes() * 1.0 / frame_width))
        energies = self.calculate_chunk_energies(reader, n_chunks, frame_width,
                                                 sample_width, n_channels)

        threshold = self.calculate_energy_threshold(energies, 0.2)
        elapsed_time = 0
        regions = []
        region_start = None

        for energy in energies:
            is_silence = energy <= threshold
            max_exceeded = region_start and elapsed_time - region_start >= max_size

            if (max_exceeded or is_silence) and region_start:
                if elapsed_time - region_start >= min_size:
                    regions.append((region_start, elapsed_time))
                    region_start = None

            elif (not region_start) and (not is_silence):
                region_start = elapsed_time
            elapsed_time += chunk_duration

        return regions

    def calculate_chunk_energies(self, reader, n_chunks, frame_width, sample_width, n_channels):
        energies = []
        for _ in range(n_chunks):
            chunk = reader.readframes(frame_width)
            energies.append(audioop.rms(chunk, sample_width * n_channels))
        return energies

    def calculate_energy_threshold(self, energies, percentile_value):
        sorted_energies = sorted(energies)
        index = int(len(sorted_energies) * percentile_value)
        return sorted_energies[index]

    def generate_subtitle(self):
        audio_filename = self.transform_audio()
        partitions = self.regions_dividing(audio_filename)
        pool = multiprocessing.Pool(10)
        converter = ConvertFLAC(path=audio_filename)
        recognizer = WhisperRecogniser()
        total_transcribe_text = []
        print("Preparing to start generating subtitles.")
        start_time = time.time()
        print(path_utils.get_saving_path())
        if partitions:
            divided_partitions = []
            total_regions = len(partitions)  
            for i, divided_region in enumerate(pool.imap(converter, partitions)):
                data, _ = librosa.load(io.BytesIO(divided_region), sr=16000)
                divided_partitions.append(data)

            for i, data in enumerate(divided_partitions):
                transcribe_text, language = recognizer(data)
                # Print percentage
                progress_percentage = (i + 1) / total_regions * 100
                print(f"[{language}][{progress_percentage:.2f}%]:{transcribe_text} ")
                total_transcribe_text.append(transcribe_text)
                print()

        subtitles_with_time_stamp = ([(r, t) for r, t in zip(partitions, total_transcribe_text) if t])
        formatted_subtitles = self.format_srt_subtitles(subtitles_with_time_stamp)
        base = path_utils.get_saving_path()
        fullname = os.path.splitext(self.filename)[0]
        nameoffolder = str(self.folder)
        name = os.path.basename(fullname)
        full_path = "{base}\\{nameoffolder}\\{name}.{format}".format(base = base, nameoffolder = nameoffolder, name = name, format = 'txt')
        path_utils.create_folder(f"{base}\\{nameoffolder}\\")
        with open(full_path, 'w', encoding='utf-8') as output_file:
            output_file.write(formatted_subtitles)

        os.remove(audio_filename)
        self.process_finished = True
        elapse = time.time() - start_time
        print("Successfully generate subtitles")
        print(f"Subtitle file generated at:{full_path}")
        print(f"Total time cost: {elapse}s")
        return full_path


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("--path", dest="filepath")
    parser.add_argument("--folder", dest="folder")
    args = parser.parse_args()
    audio_name = args.filepath
    folder_name = args.folder
    example = Audio2Subtitle(audio_name,folder_name)
    example.generate_subtitle()
