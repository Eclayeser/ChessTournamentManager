// Import necessary libraries and hooks
import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

// Functional component
function Layout() {
    
    //variable
    const [loggedIn, setLoggedIn] = useState(false);

    //react-router-dom hooks
    const location = useLocation();
    const navigate = useNavigate();

    //function that navigates to login page
    const goToLogin = () => {navigate("/login")};

    const goToDashboard = () => {navigate("/dashboard")};

    const goToHome = () => {navigate("/")};
 
    const goToAccount = () => {navigate("/account")};

    //change loggedIn state based on sessionID presence, triggered by useEffect
    useEffect(() => {
        if (localStorage.getItem("sessionID")) {
            setLoggedIn(true);
        } else {
            setLoggedIn(false);
        };
    }, [location]);

  
    //Display contents
  return (
    <div>
        {/*Header*/}
        <header>
            
            <div>
                {/*Places Logo image*/}
                <img src={require('../images/test_logo.png')} alt="Logo"/>
           </div>

           <div>
                {/* Display navigation buttons based on loggedIn state */}
                {loggedIn ? (
                    <div>
                        <button onClick={goToDashboard}>My Tournaments</button>
                        <button onClick={goToAccount}>My Account</button>
                        <button onClick={goToHome}>Home</button>
                    </div>
                ) : (
                    <button onClick={goToLogin}>Log In</button>
                )}
                <hr></hr>
           </div>

        </header>

        {/*Wrapped around*/}
        <main><Outlet /></main>

        {/*Footer*/}
        <footer>

            <div>
                <hr></hr>
                {/*Places Logo image*/}
                <img src={require('../images/test_logo.png')} alt="Logo"/>
           </div>

           <div>
                {/*Contant Us Email*/}
                <a href="mailto:mark.tarnavskyy@gmail.com">Contact Us</a>
                {/*Try Service button - to be enabled later*/}
                <button onClick={goToLogin}>Try Service</button>
           </div>

           <div>
                {/*Other Information - to be added later*/}
                <p>*to be filled later*</p>
           </div>
           
        </footer>   
    </div>
  );
}

//Export to be used by App.js
export default Layout;

