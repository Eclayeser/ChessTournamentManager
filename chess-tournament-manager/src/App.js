// Import React lib and react-router-dom library components
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// import style sheet
import './App.css';

// Import components
import Home from "./components/Home";
import LoginUser from "./components/LogIn";
import SignupUser from "./components/Signup";
import DisplayDashboard from "./components/Dashboard";


// main
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginUser />} />
        <Route path="/signup" element={<SignupUser />} />
        <Route path="/dashboard" element={<DisplayDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;

