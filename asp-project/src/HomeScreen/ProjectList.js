import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Modal from 'react-modal';
import axios from 'axios';
import data from './data.json';
import './ProjectList.css';
import './FileUpload.css';
import circleSvg from './circle.svg';
import ChatIcon from './ChatIcon.png';

// Custom styles for the modal
const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#252525',
    color: '#f0f0f0',
    borderRadius: '20px',
    width: '420px',
    padding: '30px',
    border: 'none'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)'
  }
};

Modal.setAppElement('#root');

const DynamicCard = () => {
  const [notebookName, setNotebookName] = useState('');
  const [audioNotebookName, setAudioNotebookName] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [audioModalIsOpen, setAudioModalIsOpen] = useState(false);
  const [isFileDropped, setIsFileDropped] = useState(false);
  const [showError, setShowError] = useState(false);
  const [files, setFiles] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [isAudioFileDropped, setIsAudioFileDropped] = useState(false);

  const handleAudioFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log('Selected file:', selectedFile.name);
    setAudioFile(selectedFile);
    setIsAudioFileDropped(true);
  };

  const uploadAudioFile = async () => {
    if (!audioFile || !audioNotebookName) {
      alert("Please provide all required details.");
      return;
    }

    const formData = new FormData();
    formData.append('audioFile', audioFile);
    formData.append('notebookName', audioNotebookName);

    try {
      const response = await axios.post('http://localhost:5000/uploadaudio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert("Audio file uploaded and transcription initiated.");
    } catch (err) {
      console.error(err);
      alert("Error uploading audio file.");
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
      <div className='heading-notebook'>
        <h2>Home &gt; Notebooks</h2>
        <div className="container">
          {data.notebooks.map((notebook) => (
            <div className="card" key={notebook.NotebookID}>
              <NavLink to={`/${notebook.NotebookID}`} className="hover-button" activeClassName="active">
                <img src={circleSvg} alt="Open" />
              </NavLink>
              <NavLink to={`/chat/${notebook.NotebookID}`} className="hover-chat-button" activeClassName="active">
                <img className="chaticon" src={ChatIcon} alt="Chat"/>
              </NavLink>
              <h3 className="title">{notebook.Name}</h3>
              <p className="description"><strong>Description:</strong> {notebook.Description}</p>
              <p className="file-count"><strong>File Count:</strong> {notebook.FileCounts}</p>
            </div>
          ))}
          <button className="add-button">+</button>
        </div>
      </div>
      
      <div className="form-container">
        <button type="button" className="upload-button" onClick={openModal}>Upload File</button>
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
          className="modal-input"
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
        <input 
          type="text" 
          placeholder="Notebook Name" 
          className="modal-input"
          value={audioNotebookName}
          onChange={(e) => setAudioNotebookName(e.target.value)}
        />
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
};

export default DynamicCard;
