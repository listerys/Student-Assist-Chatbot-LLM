import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import jsonData from '../HomeScreen/data.json';
import './ChatWindow.css';
import pdficon from "./pdficon.png";
import txticon from "./txticon.png";
import docicon from "./docicon.png";
import audioicon from "./audioicon.png";

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const { NotebookID } = useParams();
  const [notebookName, setNotebookName] = useState(''); // New state for storing the notebook name

  useEffect(() => {
    const notebook = jsonData.notebooks.find(n => n.NotebookID === NotebookID);
    if (notebook) {
      setSelectedFile(notebook.Files.File1.Link);
      setNotebookName(notebook.Name); // Set the notebook name
    }
  }, [NotebookID]);

  const summarizeContent = async () => {
    const summaryInput = "Summarize the content in 200 words";
    const url = `http://localhost:80/v1/search/${notebookName}?query=${encodeURIComponent(summaryInput)}`;
    try {
      const response = await axios.get(url);
      const backendResponse = response.data.output; // Extracting 'output' from response.data
      // Instead of adding the summaryInput to the messages, display the response directly
      // You could use a different state to display the summary or handle it differently in the UI
      setMessages(messages => [...messages, { text: backendResponse, sender: 'bot' }]);
    } catch (error) {
      console.error('Error communicating with the backend:', error);
    }
  };
  
  const sendMessage = async () => {
    setInput('');
    if (input.trim()) {
      setMessages(messages => [...messages, { text: input, sender: 'user' }]);
      const url = `http://localhost:80/v1/search/${notebookName}?query=${encodeURIComponent(input)}`;
      try {
        const response = await axios.get(url);
        const backendResponse = response.data.output; // Extracting 'output' from response.data
        setMessages(messages => [...messages, { text: backendResponse, sender: 'bot' }]);
      } catch (error) {
        console.error('Error communicating with the backend:', error);
      }

    }
  };

  return (
    <div className="parent-container">
      <div className="file-sidebar">
        {jsonData.notebooks.filter(n => n.NotebookID === NotebookID).map(notebook => (
          Object.values(notebook.Files).map(file => {
            const fileExtension = file.Name.split('.').pop();
            let icon;
            switch(fileExtension) {
              case 'pdf':
                icon = pdficon;
                break;
              case 'txt':
                icon = txticon;
                break;
              case 'docx':
                icon = docicon;
                break;
              case 'mp3':
                icon = audioicon;
                break;
              default:
                icon = null;
            }
            return (
              <div key={file.Name} className="file-entry" onClick={() => setSelectedFile(file.Link)}>
                {icon && <img src={icon} alt={fileExtension + " icon"} />}
                <span className="file-name">{file.Name}</span>
              </div>
            );
          })
        ))}
      </div>

      <div className="chat-container">
        <div className="chat-window">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              {message.text}
            </div>
          ))}
        </div>
        <div className="input-area">
  <input
    type="text"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
  />
  <button onClick={sendMessage}>Send</button>
  <button onClick={summarizeContent}>Summarize</button>
</div>

        
      </div>
    </div>
  );
};

export default ChatWindow;
