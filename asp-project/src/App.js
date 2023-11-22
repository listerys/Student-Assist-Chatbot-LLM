import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './Header/Header.js';
import FileUpload from './HomeScreen/FileUpload';
import ProjectList from './HomeScreen/ProjectList.js';
import Sidebar from './HomeScreen/Sidebar.js';
import ChatWindow from './ChatBot/ChatWindow.js';

function App() {
    return (
        <div>
            <Header />
            <BrowserRouter>
                {/* Sidebar and main content are displayed side by side */}
                <div style={{ display: 'flex' }}>
                    <Sidebar />
                    <div style={{ flex: 1, padding: '20px' }}>
                        <Routes>
                            <Route path="/" element={<ProjectList />} /> {/* Default route to show project list */}
                            <Route path="/notebooks" element={<ProjectList />} /> {/* You can replace this with actual components */}
                            <Route path="/sources" element={<div>Sources Content</div>} />
                            <Route path="/notes" element={<div>Notes Content</div>} />
                            <Route path="/chat/:NotebookID" element={<ChatWindow />} />
                            <Route path="/:NotebookID" element={<FileUpload />} /> {/* Route for file upload */}
                        </Routes>
                    </div>
                </div>
            </BrowserRouter>
        </div>
    );
}

export default App;
