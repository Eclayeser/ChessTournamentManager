// Import necessary libraries and hooks
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

//Functional component
const LoginUser = () => {
    //variables
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    //react-router-dom hooks
    const navigate = useNavigate();


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

            // if user was authenticated -> go to the dashboard, else -> set error value to display
            if (server_resObject.success === true) {

                //store sessionID in local storage
                localStorage.setItem("sessionID", server_resObject.session);

                navigate("/dashboard");
            } else {
                setError(server_resObject.message);
            };

        //catch any errors occured during the process
        } catch (err) {
            setError(err.message);
        };
    };

    //trigger every time the component is rendered
    useEffect(() => {
        //if sessionID is stored in local storage -> go to dashboard
        if (localStorage.getItem("sessionID")) {
            navigate("/dashboard");       
        };

        //if global message is stored in local storage -> set error value and remove global message
        if (localStorage.getItem("globalMessage")) {
            setError(localStorage.getItem("globalMessage"));
            localStorage.removeItem("globalMessage");       
        };
    }, []);

    //Display contents
    return (
        <div className="container d-flex flex-column align-items-center justify-content-center vh-70 mt-5">
            {/* 
                container d-flex: defines a flexible container
                flex-column: all its children in a column.
                align-items-center justify-content-center:centre them horizontally and vertically
                vh-70 mt-5: 70% occuping height and margin to the top
            */}
            {/*Title*/}
            <h1 className="mb-4">Log In to ChessOrchestrator</h1>
            
            {/* Dynamic Error Message */}
            {error && <p className="text-danger">{error}</p>}
            
            {/* Form */}
            <form onSubmit={authenticate} className="w-50 p-4 border rounded shadow bg-light">
                {/* 
                    w-50 bg-light: width 50% with white background
                    p-4: padding on all sides
                    border rounded shadow: rounded border around the form with shadow effect
                */}
                {/* Input Fields */}
                <div className="mb-3">
                    <label className="form-label">Username:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    {/* 
                        mb-3: margin on the bottom.
                        form-label: defined general Bootstrap label style.
                        form-control: defined general Bootstrap inut field style.
                    */}
                </div>

                <div className="mb-3">
                    <label className="form-label">Password:</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {/* Submit Button */}
                <button type="submit" className="btn btn-primary w-100">Log In</button>
                {/* 
                    btn-primary: primary colour for general purpose buttons
                    w-100: 100% (of the form width).
                */}
            </form>

            {/* Links to home and signup pages */}
            <div className="mt-3 text-center">
                <p>Back to <Link to="/" className="text-decoration-none">Home Page</Link></p>
                <p>Create new <Link to="/signup" className="text-decoration-none">Account</Link></p>
            </div>
            
        </div>
    );
};

//Export the component
export default LoginUser;


