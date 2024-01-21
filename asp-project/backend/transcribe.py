import sys
import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def transcribe_and_save(audio_path):
    # Retrieve the API key from the .env file
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("No OpenAI API key found. Please check your .env file.")

    # Initialize the OpenAI client with the API key
    client = OpenAI(api_key=api_key)

    # Log the file format for debugging
    print(f"Attempting to transcribe file with format: {os.path.splitext(audio_path)[1]}")

    try:
        # Open the audio file
        with open(audio_path, "rb") as audio_file:
            # Use OpenAI's Whisper model for transcription
            response = client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file
            )

        # Extract transcription text from the response
        transcription = response["text"]

        # Save the transcription to a text file
        text_file_path = audio_path + ".txt"
        with open(text_file_path, "w") as text_file:
            text_file.write(transcription)

        return text_file_path

    except Exception as e:
        print(f"Error occurred during transcription: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python script.py <audio_file_path>")
        sys.exit(1)

    audio_path = sys.argv[1]
    text_file_path = transcribe_and_save(audio_path)
    if text_file_path:
        print("Transcription saved to:", text_file_path)
    else:
        print("Transcription failed.")
