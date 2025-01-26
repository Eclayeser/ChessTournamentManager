// Import necessary libraries and hooks
import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// Import components
import Home from "./components/Home";
import Layout from "./components/Layout";
import LoginUser from "./components/LogIn";
import DisplayDashboard from "./components/Dashboard";
import SignupUser from "./components/SignUp";
import MyAccount from "./components/Account";
import TournamentSettings from "./components/TournamentSettings";
import CreateTournamentDisplay from "./components/CreateTournament";
import DisplayPlayers from "./components/TournamentPlayers";

// Main App Component
function App() {

  // Check if sessionID is present on localStorage, verify with server
  const checkSession = async() => {
    if (localStorage.getItem("sessionID")) {
      const sessionID = localStorage.getItem("sessionID");

      try{
        const response = await fetch("http://localhost:5000/check-session", {
          method: "GET",
          headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
        });
        const server_resObject = await response.json();

        if (server_resObject.found === false) {
          localStorage.removeItem("sessionID");
          return;
        };
        return;

      } catch (err) {
        console.error(err.message);
      };
  }
};

// Clear localStorage SessionID if SessionID is not present of server, triggered by useEffect
useEffect(() => {
  checkSession();
}, []);



return (
  <Router>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginUser />} />
        <Route path="/signup" element={<SignupUser />} />
        <Route path="/dashboard" element={<DisplayDashboard />} />
        <Route path="/create-tournament" element={<CreateTournamentDisplay />} />
        <Route path="/tournament/:tournamentId/settings" element={<TournamentSettings />} />
        <Route path="/tournament/:tournamentId/players" element={<DisplayPlayers />} />
        <Route path="/account" element={<MyAccount />} />
      </Route>
    </Routes>
  </Router>
 );
}

// Export App component
export default App;
