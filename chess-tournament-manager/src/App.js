// Import React lib and react-router-dom library components
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";


// Import components
import Home from "./components/Home";
import Layout from "./components/Layout";


// Main App Component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

// import style sheet
//import './App.css';


//import LoginUser from "./components/LogIn";
//import SignupUser from "./components/Signup";
//import DisplayDashboard from "./components/Dashboard";


//<Route path="/login" element={<LoginUser />} />
//<Route path="/signup" element={<SignupUser />} />
//<Route path="/dashboard" element={<DisplayDashboard />} />