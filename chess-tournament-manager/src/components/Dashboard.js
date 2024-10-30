// Import React lib and react-router-dom library components
import React, { Fragment, useState } from "react";
import { useLocation } from "react-router-dom";

// Functional component
const DisplayDashboard = () => {

    //variables
    const location = useLocation();
    const user = location.state?.userData;

    //Display content
    return (
        <div>
            <h1>Welcome to {user.firstname} Dashboard</h1>
            <p> <a href="/login">Log out</a></p>
        </div>
    );
};

export default DisplayDashboard;