//Import React lib and react-router-dom library components
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import Layout from "./Layout";


//Functional component
const LoginUser = () => {
    //variables
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    //event-handling function that is triggered by form
    const onSubmitForm = async e => {
        e.preventDefault();
        
        //Send request to server to login the user//
        try {
            //object to be sent to server
            const body = { givenUsername: username, givenPassword: password };

            //fetch request to server
            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            //response from server
            const server_resObject = await response.json();

            // if userFound == True -> go to the dashboard, else -> set error value to display
            if (server_resObject.found === true) {
                //store sessionID in local storage
                const sessionID = server_resObject.session;
                localStorage.setItem("sessionID", sessionID);

                navigate("/dashboard");
            } else {
                setError(server_resObject.message);
            }

        //catch any errors
        } catch (err) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        if (localStorage.getItem("sessionID")) {
            navigate("/dashboard");       
        }

        if (localStorage.getItem("globalMessage")) {
            setError(localStorage.getItem("globalMessage"));
            localStorage.removeItem("globalMessage");       
        }
    }, []);

    
    //Display contents
    return (
        <div>
            <h1>Log In to ChessManager</h1>
            
            {/* Dynamic Error Message */}
            <p style={{ color: "red" }}>{error}</p>

            <form onSubmit={onSubmitForm}>
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
