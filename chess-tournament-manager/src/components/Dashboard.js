// Import React lib and react-router-dom library components
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "./AppContext";


// Functional component
const DisplayDashboard = () => {

    //global variables
    const { username, setUsername, password, setPassword } = useContext(AppContext);

    //variables
    const [tournaments, setTournaments] = useState([]);

    const navigate = useNavigate();

    const requestTournaments = async () => {
        try {
            const body = { givenUsername: username, givenPassword: password };

            const response = await fetch("http://localhost:5000/tournaments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                
            });
            const tournaments_obj = await response.json();

            setTournaments(tournaments_obj.tournaments);
            

        //catch any errors
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        requestTournaments();
    } , []);


    // Handle click to navigate to tournament page
    const handleTournamentClick = (tournamentId) => {
        navigate(`/tournament/${tournamentId}`);
    };
    
    //Display content
    return (
        <div>
            <h1>Welcome to Dashboard</h1>
            <h2>My Tournaments</h2>
            <ul>
                {tournaments.map((tournament) => (
                    <li key={tournament.tournament_id} onClick={() => handleTournamentClick(tournament.tournament_id)}>
                        {tournament.name}
                    </li>
                ))}
            </ul>
            <p> <a href="/login">Log out</a></p>
        </div> 
    );
};

export default DisplayDashboard;



/*

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

export default DisplayDashboard;*/