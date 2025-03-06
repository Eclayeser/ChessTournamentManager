// Import necessary libraries and hooks
import React from "react";
import { Link } from "react-router-dom";


// Functional component
function Home() {

  //Display contents
  return (
    <div className="container d-flex flex-column align-items-center justify-content-center vh-70 text-center mt-3 mb-3">
        {/* Title */}
        <h1 className="mb-4">Welcome to Chess Manager</h1>

        {/* Description */}
        <div className="mb-4" style={{ maxWidth: "1000px" }}>
            <p className="lead">
                <b>Chess Manager</b> is your ultimate tool for organizing and managing chess tournaments. 
                Whether you're running a small club event or a large-scale competition, <b>Chess Manager</b> simplifies the process of organising and conducting various chess tournaments.
            </p>
            <p className="lead">
                What you can do with <b>Chess Manager</b> :
            </p>
            <ul className="list-unstyled" >
                <li>✅ <b>Create and manage tournaments</b> with 3 types available to you!</li>
                <li>✅ <b>Automatically pair players</b> based on rating and performance!</li>
                <li>✅ <b>Exploit the ability</b> of managing forbidden and predefined pairs!</li>
                <li>✅ <b>Track players progress</b> via standings with tie break systems!</li>
                <li>✅ <b>Get export options</b> for any data table that you want to print!</li>
            </ul>
            <p className="lead">
                Let's popularise chess together with <b>Chess Manager</b>!
            </p>
        </div>

        {/* Conditional Message for Non-Logged-In Users */}
        {!localStorage.getItem("sessionID") && (
            <div className="mt-1">
                <p className="mb-3"><b>Please log in or sign up to continue.</b></p>
                <div className="d-flex gap-3">
                    <Link to="/login" className="custom-link">Log In</Link>
                    <Link to="/signup" className="custom-link">Sign Up</Link>
                </div>
            </div>
        )}
    </div>
  );
}

//Export to be used by App.js
export default Home;



