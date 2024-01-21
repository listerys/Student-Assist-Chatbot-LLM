import React, { useState } from "react";
import Modal from 'react-modal';
import "./FileUpload.css";
import NotebookFilesTable from "./NotebookFilesTable";
import { useParams } from "react-router-dom";
import axios from 'axios'; // Using axios for API requests

// Custom styles for the modal
const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#252525', // Dark background for the modal
    color: '#f0f0f0', // Light text color
    borderRadius: '20px',
    width: '420px',
    padding: '30px',
    border: 'none'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)' // Dark overlay
  }
};

Modal.setAppElement('#root');

function FileUpload() {
  const [notebookName, setNotebookName] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isFileDropped, setIsFileDropped] = useState(false);
  const [showError, setShowError] = useState(false);
  const { NotebookID } = useParams();
  const [files, setFiles] = useState([]);
  const [audioModalIsOpen, setAudioModalIsOpen] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [isAudioFileDropped, setIsAudioFileDropped] = useState(false);

  const handleAudioFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log('Selected file:', selectedFile.name);
    setAudioFile(selectedFile);
    setIsAudioFileDropped(true);
};


const uploadAudioFile = async () => {
  if (!audioFile) {
    alert("No audio file selected.");
    return;
  }

  const formData = new FormData();
  formData.append('audioFile', audioFile);
  formData.append('notebookName', notebookName); // Add the notebook name to the form data

  try {
    const response = await axios.post('http://localhost:8000/uploadAudio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    alert("Audio file uploaded and transcription initiated.");
  } catch (err) {
    console.error(err);
  }
};


  const openAudioModal = () => {
    setAudioModalIsOpen(true);
  };

  const closeAudioModal = () => {
    setAudioModalIsOpen(false);
  };

  const handleAudioSubmit = async () => {
    await uploadAudioFile();
    closeAudioModal();
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(newFiles);
    setIsFileDropped(true);
    setShowError(false);
  };

  const uploadFile = async () => {
    if (files.length === 0 || !notebookName) {
      setShowError(true);
      return;
    }

    // Prepare the data for sending
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('notebookName', notebookName);

    try {
      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert("File uploaded successfully.");
    } catch (err) {
      console.error(err);
      alert("Error uploading file.");
    }
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleSubmit = async () => {
    await uploadFile();
    closeModal();
  };

  return (
<div>
      <NotebookFilesTable notebookId={NotebookID} />
      <div className="form-container">
        <button type="button" className="upload-button" onClick={openModal}>Upload File</button>
      </div>
      <div className="form-container">
        <button type="button" className="upload-button" onClick={openAudioModal}>Upload Audio File</button>
      </div>
      <Modal 
        isOpen={modalIsOpen} 
        onRequestClose={closeModal} 
        contentLabel="Upload Modal" 
        style={customModalStyles}
      >
        <h2>Upload Document</h2>
        <input 
          type="text" 
          placeholder="Notebook Name" 
          className="modal-input" // Add a class for the input
          value={notebookName}
          onChange={(e) => setNotebookName(e.target.value)}
        />
        <div className="drag-file-area">
          <span className="material-icons-outlined upload-icon">file_upload</span>
          <h3 className="dynamic-message">{isFileDropped ? "File Dropped Successfully!" : "Drag & drop any file here"}</h3>
          <label className="label">
            or 
            <span className="browse-files">
            <input type="file" className="default-file-input" multiple onChange={handleFileChange} />
              <span className="browse-files-text">browse file</span>
            </span>
          </label>
        </div>
        {showError && (
          <span className="error-message">
            Please provide all required details
          </span>
        )}
        <button className="upload-button" onClick={handleSubmit}>Submit</button>
      </Modal>
      <Modal 
        isOpen={audioModalIsOpen} 
        onRequestClose={closeAudioModal} 
        contentLabel="Audio Upload Modal" 
        style={customModalStyles}
      >
        <h2>Upload Audio File</h2>
        <div className="drag-file-area">
          <span className="material-icons-outlined upload-icon">music_note</span>
          <h3 className="dynamic-message">{isAudioFileDropped ? "Audio File Dropped Successfully!" : "Drag & drop MP3 file here"}</h3>
          <label className="label">
            or 
            <span className="browse-files">
            <input type="file" className="default-file-input" accept=".flac, .m4a, .mp3, .mp4, .mpeg, .mpga, .oga, .ogg, .wav, .webm" onChange={handleAudioFileChange} />
              <span className="browse-files-text">browse file</span>
            </span>
          </label>
        </div>
        <button className="upload-button" onClick={handleAudioSubmit}>Submit</button>
      </Modal>
    </div>
  );
}

export default FileUpload;
