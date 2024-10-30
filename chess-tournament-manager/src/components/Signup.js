//Import React lib and react-router-dom library components
import React, { useState } from "react";
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
    const navigate = useNavigate();

    //function that is triggered by form
    const onSubmitForm = async e => {
        e.preventDefault();

        // Check if passwords match
        if (password !== rePassword) {
            setError("Passwords do not match");
            return;
        }

        //Send request to server to add new user//
        try {
            const body = { firstName, surname, username, email, password };
            const response = await fetch("http://localhost:5000/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await response.json();

            // if successful -> go to login page, else -> set error value to display
            if (data.success === true) {
                navigate("/login");
            } else {
                setError(data.message);
            }

        } catch (err) {
            console.error(err.message);
            setError("An error occurred during sign up");
        }
        // - //
    };

    //Display contents
    return (
        <div>
            <form onSubmit={onSubmitForm} style={{ display: "flex", flexDirection: "column", maxWidth: "400px", margin: "15px" }}>
                <h2>Sign Up</h2>

                {/* Dynamic Error Message */}
                {error && <p style={{ color: "red" }}>{error}</p>}

                {/* Input Fields */}
                <label>First name: <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required/></label>
                <label>Surname: <input type="text" value={surname} onChange={e => setSurname(e.target.value)} required /></label>
                <label>Username: <input type="text" value={username} onChange={e => setUsername(e.target.value)} required /></label>
                <label>Email: <input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
                <label>Password: <input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
                <label>Re-enter password: <input type="password" value={rePassword} onChange={e => setRePassword(e.target.value)} required /></label>
                <button type="submit">Sign Up</button>
            </form>
            <p>Back to <Link to="/login">Login</Link></p>
        </div>
    );
};

export default SignupUser;