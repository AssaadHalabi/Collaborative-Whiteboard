// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ChooseName from './components/ChooseName';
import DrawingCanvas from './components/DrawingCanvas';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChooseName />} />
        <Route path="/drawing" element={<DrawingCanvas />} />
      </Routes>
    </Router>
  );
};

export default App;
