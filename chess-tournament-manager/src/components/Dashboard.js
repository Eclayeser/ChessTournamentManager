import React, { Fragment, useState } from "react";
import { useLocation } from "react-router-dom";

const DisplayDashboard = () => {

    const location = useLocation();
    const user = location.state?.name;

    return (
        <div>
            <h1>Welcome to {user} Dashboard</h1>
            <p>Back to <a href="/login">LogIn</a></p>
        </div>
    );
};

export default DisplayDashboard;