// Import React lib and react-router-dom library components
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";

// Functional component
function Layout() {
  
  //Display contents
  return (
    <div>
        <header>
            {/*Header*/}
        </header>
        {/*Wrapped around*/}
        <main><Outlet /></main>
        <footer>
            {/*Footer*/}
        </footer>   
    </div>
  );
}

//Export to be used by App.js
export default Layout;

//<div>
//                {/*Logo*/}
//                <img src={require('../images/test_logo.png')} alt="Logo"/>
//           </div>
//           <div>
//                <button>Log In</button>
//           </div>