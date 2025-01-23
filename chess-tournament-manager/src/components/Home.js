// Import React lib and react-router-dom library components
import React from "react";
import { Link } from "react-router-dom";


// Functional component
function Home() {
  
  //Display contents
  return (
      <div>
          <h1>Welcome to Chess Manager</h1>
          { localStorage.getItem("sessionID") ? (null) : (
            <div>
              <p>Please log in or sign up to continue.</p>
              {/*Links to login and signup pages*/}
              <p><Link to="/login">Log In</Link></p>
              <p><Link to="/signup">Sign Up</Link></p>
            </div>
          )
          }
      </div>
  );
}

//Export to be used by App.js
export default Home;



