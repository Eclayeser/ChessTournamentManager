//Import React lib and react-router-dom library components
import React, { Fragment, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

//Functional component
const LoginUser = () => {

    //variables
    const [username, setUsername] = useState("") ;
    const [password, setPassword] = useState("") ;
    const [error, setError] = useState("");
    const navigate = useNavigate();  

    //function that is triggered by form
    const onSubmitForm = async e => {
        e.preventDefault();
        
        //Send request to server to login the user//
        try {
            const body = { username, password };
            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await response.json();

            // if successful -> go to the dashboard, else -> set error value to display
            if (data.success) {
                navigate("/dashboard", { state: { userData: data.user_data} });
            } else {
                setError("Icorrent username or password")
            }

        } catch (err) {
            console.error(err.message);
        }
    };

    //Display contents
    return (
        <Fragment>
            <h1>Log In to ChessManager</h1>
            <form onSubmit={onSubmitForm} style={{ display: "flex", flexDirection: "column", maxWidth: "250px" }}>

                {/* Dynamic Error Message */}
                {error && <p style={{ color: "red" }}>{error}</p>}

                {/* Input Fields */}
                <label>Username: <input type="text" value={username} onChange={e => setUsername(e.target.value)} required/></label>
                <label>Password: <input type="password" value={password} onChange={e => setPassword(e.target.value)} required/></label>
                <button>Log In</button>
                <br></br>
                <p>Back to <Link to="/">Home Page</Link></p>
                <p>Create new <Link to="/signup">Account</Link></p>
            </form>
        </Fragment>
    );
};

export default LoginUser;