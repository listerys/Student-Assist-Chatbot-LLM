import React, { useRef } from 'react';
import axios from 'axios';

function FileUploadComponent() {
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        // Handle file selection
        const file = event.target.files[0];
        if (file) {
            uploadFile(file);
        }
    };

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('audioFile', file);

        try {
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response.data);
            alert('File uploaded successfully!');
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file');
        }
    };

    const handleButtonClick = () => {
        // Programmatically click the hidden file input
        fileInputRef.current.click();
    };

    return (
        <div>
            <input 
                type="file" 
                style={{ display: 'none' }} 
                ref={fileInputRef}
                onChange={handleFileChange} 
            />
            <button onClick={handleButtonClick}>Upload File</button>
        </div>
    );
}

export default FileUploadComponent;
