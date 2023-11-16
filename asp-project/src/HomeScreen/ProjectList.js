import React from 'react';
import { NavLink } from 'react-router-dom';

const ProjectList = ({ title, description, link }) => {
    console.log(title, description, link);
    return (
        <div className="card">
            <h3>{title}</h3>
            <p>{description}</p>
            <NavLink to={link} className="card-button">
                Go to File Upload
            </NavLink>
        </div>
    );
};

export default ProjectList;
