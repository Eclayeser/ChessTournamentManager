import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';

//components

import LoginUser from "./components/LogIn";
import DisplayError from "./components/ErrorPage";
import DisplayDashboard from "./components/Dashboard";
import HomePage from "./components/HomePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginUser />} />
        <Route path="/error" element={<DisplayError />} />
        <Route path="/dashboard" element={<DisplayDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
