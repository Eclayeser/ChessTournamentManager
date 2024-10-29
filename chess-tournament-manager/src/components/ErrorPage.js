import React, { Fragment, useState } from "react";
import { useLocation } from "react-router-dom";

const DisplayError = () => {

    const location = useLocation();
    const message = location.state?.message || "An error occurred";

    return (
        <div>
            <h1>Error</h1>
            <p>{message}</p>
            <p>Back to <a href="/">LogIn</a></p>
        </div>
    );
};

export default DisplayError;