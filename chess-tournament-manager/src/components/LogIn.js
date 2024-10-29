import React, { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginUser = () => {

    const [username, setUsername] = useState("") ;
    const [password, setPassword] = useState("") ;
    const navigate = useNavigate();  

    const onSubmitForm = async e => {
        e.preventDefault();
        
        try {
            const body = { username, password };
            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await response.json();


            if (data.success) {
                navigate("/dashboard", { state: { user: username } });
            } else {
                // Redirect to ErrorPage with a message
                navigate("/error", { state: { message: "Invalid username or password" } });
            }

        } catch (err) {
            console.error(err.message);
            navigate("/error", { state: { message: "An error occurred during login" } });
        }
    };

    return (
        <Fragment>
            <h1>Log In to ChessManager</h1>
            <form onSubmit={onSubmitForm}>
                <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required/>
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required/>
                <button>Log In</button>
            </form>
        </Fragment>
    );
};

export default LoginUser;