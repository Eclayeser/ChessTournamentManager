import React, { Fragment, useState } from "react";

const InputUsername = () => {

    const [username, setUsername] = useState("") ;   

    const onSubmitForm = async e => {
        e.preventDefault();
        try {
            const body = { username };
            const response = await fetch("http://localhost:5000/newUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            console.log(response);
        } catch (err) {
            console.error(err.message);
        }
    }

    return (
        <Fragment>
            <h1>Log In to ChessManager</h1>
            <form onSubmit={onSubmitForm}>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}/>
                <button>Log In</button>
            </form>
        </Fragment>
    );
};

export default InputUsername;