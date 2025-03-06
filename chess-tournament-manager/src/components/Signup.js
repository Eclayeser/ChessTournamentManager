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
        <div className="container d-flex flex-column align-items-center justify-content-center vh-100 mt-5 mb-4">
            {/* Title */}
            <h1 className="mb-4">Sign Up for ChessManager</h1>

            {/* Dynamic Error Message */}
            {error && <p className="text-danger">{error}</p>}

            {/* Form */}
            <form onSubmit={createUser} className="w-50 p-4 border rounded shadow bg-light">
                {/* Input Fields */}
                <div className="mb-3">
                    <label className="form-label">First Name:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Surname:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Username:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Email:</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
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

                <div className="mb-3">
                    <label className="form-label">Re-enter Password:</label>
                    <input
                        type="password"
                        className="form-control"
                        value={rePassword}
                        onChange={(e) => setRePassword(e.target.value)}
                        required
                    />
                </div>

                {/* Submit Button */}
                <button type="submit" className="btn btn-primary w-100">Sign Up</button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-3 text-center mb-4">
                <p>Already have an account? <Link to="/login" className="text-decoration-none">Log In</Link></p>
            </div>
        </div>
    );
};

//Export component to be used in App.js
export default SignupUser;
