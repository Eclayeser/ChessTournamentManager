// Import React lib and react-router-dom library components
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// Import components
import Home from "./components/Home";
import Layout from "./components/Layout";
import LoginUser from "./components/LogIn";
import DisplayDashboard from "./components/Dashboard";
import SignupUser from "./components/Signup";
import TournamentDetails from "./components/TournamentDetails";


// Import AppContext
import { AppContext } from "./components/AppContext";


// Main App Component
function App() {

  //global variables
  const[username, setUsername] = useState("");
  const[password, setPassword] = useState("");
  const[error, setError] = useState("");

  return (
    <AppContext.Provider value={{username, setUsername, password, setPassword, error, setError}}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginUser />} />
            <Route path="/signup" element={<SignupUser />} />
            <Route path="/dashboard" element={<DisplayDashboard />} />
            <Route path="/tournament/:tournamentId" element={<TournamentDetails />} />
          </Route>
        </Routes>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
