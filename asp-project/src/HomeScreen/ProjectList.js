import React from 'react';
import { NavLink } from 'react-router-dom';
import data from './data.json';
import './ProjectList.css';
import circleSvg from './circle.svg';
import ChatIcon from './ChatIcon.png';

const DynamicCard = () => {
  return (
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
  );
};

export default DynamicCard;
