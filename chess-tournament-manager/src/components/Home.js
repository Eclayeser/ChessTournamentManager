// Import React lib and react-router-dom library components
import React, { Fragment } from "react";
import { Link } from "react-router-dom";

// Functional component
function Home() {
  //Display contents
  return (
    <Fragment>
        <div>
            <h1>Welcome to Chess Manager</h1>
            <p>Please log in or sign up to continue.</p>
            <p><Link to="/login">Log In</Link></p>
            <p><Link to="/signup">Sign Up</Link></p>
        </div>
    </Fragment>
  );
}

export default Home;