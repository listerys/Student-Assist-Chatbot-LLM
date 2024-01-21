import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css'; // Import your CSS file

function Sidebar() {
    return (
        <div className="sidebar">
            <div className="logo-space"></div> {/* Placeholder for Logo */}
            <ul>
                <li><NavLink to="/notebooks" activeClassName="active">Notebooks</NavLink></li>
            </ul>
        </div>
    );
}

export default Sidebar;
