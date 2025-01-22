// Import React lib and react-router-dom library components
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";

// Functional component
function Layout() {
    
    //variable
    const navigate = useNavigate();
    //function that navigates to login page
    const clickToLogin = () => {
        navigate("/login");
    }

    const clickToDashboard = () => {
        navigate("/dashboard");
    }

  //Display contents
  return (
    <div>
        <header>
            {/*Header*/}
            <div>
                {/*Places Logo image*/}
                <img src={require('../images/test_logo.png')} alt="Logo"/>
           </div>
           <div>
                {/*Places Log In button*/}
                <button onClick={clickToLogin}>Log In</button>
                <hr></hr>
           </div>
        </header>
        {/*Wrapped around*/}
        <main><Outlet /></main>
        <footer>
            {/*Footer*/}
            <div>
                <hr></hr>
                {/*Places Logo image*/}
                <img src={require('../images/test_logo.png')} alt="Logo"/>
           </div>

           <div>
                {/*Contant Us Email*/}
                <a href="mailto:mark.tarnavskyy@gmail.com">Contact Us</a>
                {/*Try Service button - to be enabled later*/}
                <button onClick={clickToDashboard}>Try Service</button>
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

