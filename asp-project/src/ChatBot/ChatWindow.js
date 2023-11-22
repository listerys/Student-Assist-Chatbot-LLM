import React, { useState, useEffect } from "react";
import jsonData from '../HomeScreen/data.json'; // Importing the JSON data
import "./ChatWindow.css";
import { useParams } from "react-router-dom";
import pdficon from "./pdficon.png";
import txticon from "./txticon.png";
import docicon from "./docicon.png";
import audioicon from "./audioicon.png";

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(""); // State for the selected file's URL
  const { NotebookID } = useParams();

  useEffect(() => {
    // Set the default selected file when the component mounts or NotebookID changes
    const notebook = jsonData.notebooks.find(n => n.NotebookID === NotebookID);
    if (notebook && notebook.Files.File1) {
      setSelectedFile(notebook.Files.File1.Link);
    }
  }, [NotebookID]);

  const sendMessage = () => {
    if (input) {
      setMessages([...messages, { text: input, sender: "user" }]);
      setInput("");
    }
  };

  return (
    <div className="parent-container">
      <div className="file-sidebar">
        {/* Render the list of files */}
        {jsonData.notebooks.filter(n => n.NotebookID === NotebookID).map(notebook => (
  Object.values(notebook.Files).map(file => {
    const fileExtension = file.Name.split('.').pop(); // Get the file extension
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
        icon = null; // or some default icon
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

      <div className="pdf-container">
        <object data={selectedFile} type="application/pdf" width="100%" height="100%">
          <p>Alternative text - include a link <a href={selectedFile} className="pdf-link">to the PDF!</a></p>
        </object>
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
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
