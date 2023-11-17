import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Header from './Header/Header.js';
import FileUpload from './HomeScreen/FileUpload';
import ProjectList from './HomeScreen/ProjectList.js';

function App() {
    return (
        <div>
             <Header />
            <BrowserRouter> 
                <Routes>
                    <Route path="/" element={<ProjectList />} /> {/* Route for the project list */}
                    <Route path="/:NotebookID" element={<FileUpload />} /> {/* Route for file upload */}
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
