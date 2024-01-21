import os
from pathlib import Path
import platform
import stat


def check_exist(file_name, file_dir):
    if file_name not in (os.listdir(file_dir)):
        print(f"{file_name} not exist in {file_dir}")

def get_model_path():
    infer_model_path = os.path.join(CURRENT_DIR, 'misc', 'model')
    return infer_model_path

def get_saving_path():
    saving_path = os.path.join(PARENT_DIR, 'api', 'resources')
    return saving_path

def create_folder(folder_path):
    try:
        os.mkdir(folder_path)
        print(f"Folder '{folder_path}' created successfully.")
    except FileExistsError:
        print(f"Folder '{folder_path}' already exists.")

CURRENT_DIR = str(Path(os.path.abspath(__file__)).parent)
PARENT_DIR = str(Path(os.path.abspath(__file__)).parent.parent)

check_exist('model', os.path.join(CURRENT_DIR, 'misc'))
check_exist('ffmpeg.exe', os.path.join(CURRENT_DIR, 'misc'))

sys_str = platform.system()
FFMPEG_PATH = os.path.join(CURRENT_DIR, 'misc','ffmpeg.exe')
os.chmod(FFMPEG_PATH, stat.S_IRWXU+stat.S_IRWXG+stat.S_IRWXO)



