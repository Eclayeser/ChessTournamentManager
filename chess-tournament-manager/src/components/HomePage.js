import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div>
      <h1>Welcome to Our App</h1>
      <p>Please log in or sign up to continue.</p>
      <Link to="/login">Log In</Link>
      <br />
      <Link to="/signup">Sign Up</Link>
    </div>
  );
}

export default HomePage;