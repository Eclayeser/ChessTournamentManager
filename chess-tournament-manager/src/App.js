// Import React lib and react-router-dom library components
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// Import components
import Home from "./components/Home";
import Layout from "./components/Layout";
import LoginUser from "./components/LogIn";
import DisplayDashboard from "./components/Dashboard";
import SignupUser from "./components/Signup";
import MyAccount from "./components/Account";
import TournamentSettings from "./components/TournamentSettings";

// Main App Component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginUser />} />
          <Route path="/signup" element={<SignupUser />} />
          <Route path="/dashboard" element={<DisplayDashboard />} />
          <Route path="/tournament/:tournamentId/settings" element={<TournamentSettings />} />
          <Route path="/account" element={<MyAccount />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
