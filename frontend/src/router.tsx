// src/router.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ReadingPage from './pages/ReadingPage';
import MusicToggle from './components/MusicToggle';

export const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <MusicToggle />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/reading" element={<ReadingPage />} />
      </Routes>
    </BrowserRouter>
  );
};
