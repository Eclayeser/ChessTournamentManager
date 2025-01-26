// Import necessary libraries and hooks
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

//Functional component
const LoginUser = () => {
    //variables
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    //react-router-dom hooks
    const navigate = useNavigate();
    const location = useLocation();

    //event-handling function, to authenticate a user, triggered by form
    const authenticate = async e => {
        e.preventDefault();
        
        try {

            //object to be sent to server
            const body = { givenUsername: username, givenPassword: password };

            //send request to server
            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            //response from server
            const server_resObject = await response.json();

            // if user was authenticated -> go to the dashboard and add a session, else -> set error value to display
            if (server_resObject.success === true) {

                const sessionID = server_resObject.session;
                localStorage.setItem("sessionID", sessionID);

                navigate("/dashboard");

            } else {
                setError(server_resObject.message);
            };

        //catch any errors
        } catch (err) {
            console.error(err.message);
        }
    };

    //redirect to dashboard if sessionID is present, and display global message if present, triggered by useEffect
    useEffect(() => {
        if (localStorage.getItem("sessionID")) {
            navigate("/dashboard");       
        };

        if (localStorage.getItem("globalMessage")) {
            setError(localStorage.getItem("globalMessage"));
            localStorage.removeItem("globalMessage");       
        };
    }, [location]);

    
    //Display contents
    return (
        <div>
            <h1>Log In to ChessManager</h1>
            
            {/* Dynamic Error Message */}
            {error && <p style={{color: "red"}}>{error}</p>}
            
            {/* Form to log in */}
            <form onSubmit={authenticate}>

                {/* Input Fields */}
                <label>Username: <input type="text" value={username} onChange={e => setUsername(e.target.value)} required/></label>
                <label>Password: <input type="password" value={password} onChange={e => setPassword(e.target.value)} required/></label>
                <button type="submit">Log In</button>

            </form>

            {/* Links to home and signup pages */}
            <p>Back to <Link to="/">Home Page</Link></p>
            <p>Create new <Link to="/signup">Account</Link></p>
        </div>
    );
};

//Export to be used by App.js
export default LoginUser;
