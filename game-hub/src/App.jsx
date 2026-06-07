import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/Home';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Future Games wll go here, e.g., <Route path="/game/cards" element={<CardGame />} /> */}
      </Routes>
    </Router>
  )
}