import React, { useState, useEffect } from 'react';
import data from './data.json'; // Importing the JSON data
import "./NotebookFilesTable.css";

const NotebookFilesTable = ({ notebookId }) => {
  const [notebook, setNotebook] = useState(null);

  useEffect(() => {
    // Find the notebook with the given ID
    const foundNotebook = data.notebooks.find(nb => nb.NotebookID === notebookId);
    setNotebook(foundNotebook);
  }, [notebookId]);

  if (!notebook) {
    return <div>Loading...</div>;
  }

  return (
    <div className="notebook-table-container">
      <h2>{notebook.Name}</h2>
      <table className="notebook-table">
        <thead>
          <tr>
            <th>File Name</th>
            <th>File Type</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(notebook.Files).map(([key, file], fileIndex) => {
            if (file.Name) {
              return (
                <tr key={fileIndex}>
                  <td>{file.Name}</td>
                  <td>{file.Type}</td>
                </tr>
              );
            }
            return null;
          })}
        </tbody>
      </table>
    </div>
  );
}

export default NotebookFilesTable;
