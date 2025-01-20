//Import React lib and react-router-dom library components
import React, { Fragment, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";

//Import AppContext
import { AppContext } from "./AppContext";

//Functional component
const LoginUser = () => {
    //variables
    const { username, setUsername, password, setPassword, error, setError } = useContext(AppContext);

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
            const server_res_obj = await response.json();
    
            // if userFound == True -> go to the dashboard, else -> set error value to display
            if (server_res_obj.found === true) {
                navigate("/dashboard");
            } else {
                setError(server_res_obj.message);
            }

        //catch any errors
        } catch (err) {
            console.error(err.message);
        }
    };

    //Display contents
    return (
        <Fragment>
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
        </Fragment>
    );
};

//Export to be used by App.js
export default LoginUser;
