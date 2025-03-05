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
import DisplayStandings from "./components/TournamentStandings";
import RoundsDisplay from "./components/TournamentRounds";

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Main App Component
function App() {

  // Function to check if existing in localStorage session matches any server session
  const checkSession = async() => {
    // If sessionID is present on localStorage, verify with server
    if (localStorage.getItem("sessionID")) {

      try{
        // Send request to server
        const response = await fetch("http://localhost:5000/check-session", {
          method: "GET",
          // include sessionID in headers
          headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
        });
        // Response from server
        const server_resObject = await response.json();

        // If sessionID is not found on server, remove from localStorage
        if (server_resObject.found === false) {
          localStorage.removeItem("sessionID");
          return;
        };

        // If sessionID is found on server, continue
        return;

      // Log any errors
      } catch (err) {
        console.error(err.message);
      };
  };
};

//trigger every time the component is rendered
useEffect(() => {
  //call checkSession function
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
        <Route path="/tournament/:tournamentId/standings" element={<DisplayStandings />} />
        <Route path="/tournament/:tournamentId/rounds" element={<RoundsDisplay />} />
        <Route path="/account" element={<MyAccount />} />
      </Route>
    </Routes>
  </Router>
 );
}

// Export App component
export default App;
