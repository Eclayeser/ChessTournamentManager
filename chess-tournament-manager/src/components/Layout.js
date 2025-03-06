// Import necessary libraries and hooks
import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

// Functional component
function Layout() {
    
    //react-router-dom hooks
    const navigate = useNavigate();

    //Display contents
  return (
    <div className="d-flex flex-column min-vh-100">
        {/*Header*/}
        <header className="navbar navbar-expand-lg navbar-dark bg-primary px-4 py-3">
            
            <div className="container-fluid"> 
                
                {/*Places Logo image*/}
                <img src={require('../images/ChessTMLogo.png')} alt="Logo" height="75"/>
                
                

                <div className="ms-auto">
                        {/*If sessionID is present, display different buttons*/}
                        { localStorage.getItem("sessionID") ? (
                            <div>
                                <button className="btn btn-outline-light me-2" onClick={() => navigate("/dashboard")}>My Tournaments</button>
                                <button className="btn btn-outline-light me-2" onClick={() => navigate("/account")}>My Account</button>
                                <button className="btn btn-outline-light" onClick={() => navigate("/")}>Home</button>
                            </div>
                        ) : (
                            <button className="btn btn-light" onClick={() => navigate("/login")}>Log In</button>
                        )}
                </div>
            </div>

        </header>

        {/*Wrapped around*/}
        <main className="flex-grow-1"><Outlet /></main>

        {/*Footer*/}
        <footer className="bg-dark text-light py-4">

            <div className="container">

                <div className="row align-items-center text-center text-md-start">

                    {/*Places Logo image*/}
                    <div className="col-md-3 mb-3 mb-md-0">
                        <img src={require('../images/ChessTMLogo.png')} alt="Logo"  height="50" />
                    </div>

                    {/* Contact & Try Service (Center) */}
                    <div className="col-md-6">
                        <a href="mailto:mark.tarnavskyy@gmail.com" className="text-info text-decoration-none me-3">Contact Us</a>
                        <button className="btn btn-outline-light" onClick={() => navigate("/login")}>Try Service</button>
                    </div>

                    <div className="col-md-3 text-md-end">
                        {/*Other Information - to be added later*/}
                        <p>Inspired by <b>ECF</b> - 2025</p>
                    </div>

                </div>    

            </div>
           
        </footer>   
    </div>
  );
}

//Export to be used by App.js
export default Layout;

