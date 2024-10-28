import React, { Fragment } from "react";

const InputUsername = () => {
    return (
        <Fragment>
            <h1>Log In to ChessManager</h1>
            <form>
                <input type="text" />
                <button>Log In</button>
            </form>
        </Fragment>
    );
};

export default InputUsername;