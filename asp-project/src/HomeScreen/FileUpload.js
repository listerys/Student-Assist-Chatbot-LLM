import React, { useState, useEffect } from "react";
import AWS from "aws-sdk";
import "./FileUpload.css"; // Import your CSS file

function FileUpload() {
  const [file, setFile] = useState(null);
  const [fileInfo, setFileInfo] = useState({ name: "", size: 0 });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isFileDropped, setIsFileDropped] = useState(false);
  const [showError, setShowError] = useState(false);

  // AWS Configurations
  const S3_BUCKET = "aspproject2023";
  const REGION = "us-east-2";
  AWS.config.update({
    accessKeyId: "AKIAUGKPRCK5NrreS3ILIIU",
    secretAccessKey: "ESW4nL8YmoTonr+rrtIWeBZZ7bH1Ds52xK4iCm6jyQy",
  });
  const s3 = new AWS.S3({
    params: { Bucket: S3_BUCKET },
    region: REGION,
  });

  const handleFileChange = (e) => {
    const newFile = e.target.files[0];
    setFile(newFile);
    setFileInfo({ name: newFile.name, size: (newFile.size / 1024).toFixed(1) });
    setIsFileDropped(true);
    setShowError(false);
  };

  const uploadFile = async () => {
    if (!file) {
      setShowError(true);
      return;
    }

    const params = {
      Bucket: S3_BUCKET,
      Key: file.name,
      Body: file,
    };

    try {
      await s3.putObject(params)
        .on("httpUploadProgress", (evt) => {
          setUploadProgress(parseInt((evt.loaded * 100) / evt.total));
        })
        .promise();
      alert("File uploaded successfully.");
    } catch (err) {
      console.error(err);
      alert("Error uploading file.");
    }
  };

  // Drag and Drop Logic
  useEffect(() => {
    const dragFileArea = document.querySelector(".drag-file-area");

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Logic for drag over
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const newFile = files[0];
        setFile(newFile);
        setFileInfo({ name: newFile.name, size: (newFile.size / 1024).toFixed(1) });
        setIsFileDropped(true);
        setShowError(false);
      }
    };

    // Add event listeners
    dragFileArea.addEventListener("dragover", handleDragOver);
    dragFileArea.addEventListener("drop", handleDrop);

    // Cleanup function
    return () => {
      dragFileArea.removeEventListener("dragover", handleDragOver);
      dragFileArea.removeEventListener("drop", handleDrop);
    };
  }, []);

  return (
    <div className="form-container">
      <div className="upload-files-container">
        <div className="drag-file-area">
          <span className="material-icons-outlined upload-icon">file_upload</span>
          <h3 className="dynamic-message">{isFileDropped ? "File Dropped Successfully!" : "Drag & drop any file here"}</h3>
          <label className="label">
            or 
            <span className="browse-files">
              <input type="file" className="default-file-input" onChange={handleFileChange} />
              <span className="browse-files-text">browse file</span>
            </span>
          </label>
        </div>
        {showError && (
          <span className="cannot-upload-message">
            <span className="material-icons-outlined">error</span> Please select a file first
            <span className="material-icons-outlined cancel-alert-button" onClick={() => setShowError(false)}>cancel</span>
          </span>
        )}
        <div className="file-block" style={{ display: isFileDropped ? "flex" : "none" }}>
          <div className="file-info">
            <span className="file-name">{fileInfo.name}</span> | <span className="file-size">{fileInfo.size} KB</span>
          </div>
          <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
        </div>
        <button type="button" className="upload-button" onClick={uploadFile}>Upload</button>
      </div>
    </div>
  );
}

export default FileUpload;
