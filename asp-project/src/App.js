import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Header/Header.js';
import FileUpload from './HomeScreen/FileUpload';

function App() {
    return (
        <div>
            <Header/>
            <FileUpload/>
        </div>
    );
}

export default App;
