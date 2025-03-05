//Import React lib and react-router-dom library components
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

//Functional component
const SignupUser = () => {

    //variables
    const [firstName, setFirstName] = useState("");
    const [surname, setSurname] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const [error, setError] = useState("");

    //react-router-dom hook
    const navigate = useNavigate();

    //function that is triggered by form
    const createUser = async e => {
        e.preventDefault();
        // Check if passwords match
        if (password !== rePassword) {
            setError("Passwords do not match");
            return;
        };
        try {
            // object to be sent to server
            const body = { firstName, surname, username, email, password };
            //send request to server
            const response = await fetch("http://localhost:5000/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            //response from server
            const server_resObject = await response.json();

            // if user creation was successful -> go to login page, set success message
            if (server_resObject.success === true) {
                localStorage.setItem("globalMessage", server_resObject.message);
                navigate("/login");
            //else -> set error value to display
            } else {
                setError(server_resObject.message);
            };

        //catch any errors   
        } catch (err) {
            console.error(err.message);
        };
    };

    //redirect to dashboard if sessionID is present, triggered by useEffect
    useEffect(() => {
        if (localStorage.getItem("sessionID")) {
            navigate("/dashboard");       
        };
    }, []);

    //Display contents
    return (
        <div>
            {/* Form */}
            <form onSubmit={createUser} style={{ display: "flex", flexDirection: "column", maxWidth: "400px", margin: "15px" }}>

                <h2>Sign Up</h2>
                {/* Dynamic Error Message */}
                {error && <p style={{color: "red"}}>{error}</p>}
                {/* Input Fields */}
                <label>First name: <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required/></label>
                <label>Surname: <input type="text" value={surname} onChange={e => setSurname(e.target.value)} required /></label>
                <label>Username: <input type="text" value={username} onChange={e => setUsername(e.target.value)} required /></label>
                <label>Email: <input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
                <label>Password: <input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
                <label>Re-enter password: <input type="password" value={rePassword} onChange={e => setRePassword(e.target.value)} required /></label>
                {/* Submit button */}
                <button type="submit">Sign Up</button>

            </form>
            {/* Back to login link */}
            <p>Back to <Link to="/login">Login</Link></p>
        </div>
    );
};

//Export component to be used in App.js
export default SignupUser;
