// Import necessary libraries and hooks
import React from "react";
import { Link } from "react-router-dom";


// Functional component
function Home() {

  //Display contents
  return (
      <div>
          <h1>Welcome to Chess Manager</h1>

          {/*If sessionID is present, display nothing*/}
          {/*else, display message and links to login and signup pages*/} 
          { localStorage.getItem("sessionID") ? (null) : (
            <div>
              <p>Please log in or sign up to continue.</p>
              <p><Link to="/login">Log In</Link></p>
              <p><Link to="/signup">Sign Up</Link></p>
            </div>
          )}
          
      </div>
  );
}

//Export to be used by App.js
export default Home;



