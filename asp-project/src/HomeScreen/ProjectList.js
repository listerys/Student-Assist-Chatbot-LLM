import React from 'react';
import { NavLink } from 'react-router-dom';
import data from './data.json';
import './ProjectList.css';
import circleSvg from './circle.svg';

const DynamicCard = () => {
  return (
    <div className="container">
      {data.notebooks.map((notebook) => (
        <div className="card" key={notebook.NotebookID}>
          <NavLink to={`/${notebook.NotebookID}`} className="hover-button" activeClassName="active">
            <img src={circleSvg} alt="Open" />
          </NavLink>
          <h3 className="title">{notebook.Name}</h3>
          <p className="description"><strong>Description:</strong> {notebook.Description}</p>
          <p className="file-count"><strong>File Count:</strong> {notebook.FileCounts}</p>
        </div>
      ))}
    </div>
  );
};

export default DynamicCard;
