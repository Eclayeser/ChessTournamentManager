// Import React lib and react-router-dom library components
import React, { Fragment, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

// Functional component
const DisplayDashboard = () => {

    //variables
    const location = useLocation();
    const user = location.state?.userData;
    const [tournaments, setTournaments] = useState([]);

    //Fetch tournaments function
    const getTournaments = async () => {
        try {
            const body = { user_id: user.user_id };
            const response = await fetch("http://localhost:5000/tournaments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            setTournaments([data]);
            

        } catch (err) {
            console.error(err.message);
            
        }
    };

    //Use useEffect to fetch tournaments when the component mounts
    useEffect(() => {
        getTournaments();
    }, []);

    console.log(tournaments)
    //Display content
    return (
        <Fragment>
            <div>
                <h1>Welcome to {user.firstname} Dashboard</h1>
                <h2>Tournaments</h2>
                <ul>
                    {tournaments.map((tournament, index) => (<li key={index}>{tournament.tournament_name}</li>))}
                </ul>
                <p> <a href="/login">Log out</a></p>
            </div>
        </Fragment>
    );
};

export default DisplayDashboard;