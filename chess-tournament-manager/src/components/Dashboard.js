// Import React lib and react-router-dom library components
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

//Import AppContext
import { AppContext } from "./AppContext";


// Functional component
const DisplayDashboard = () => {

    //global variables
    const { username, password, setError } = useContext(AppContext);

    //variables
    const [tournaments, setTournaments] = useState([]);

    const navigate = useNavigate();

    //Fetch tournaments function
    const requestTournaments = async () => {
        try {
            //object to be sent to server
            const body = { givenUsername: username, givenPassword: password };

            //fetch request to server
            const response = await fetch("http://localhost:5000/tournaments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                
            });
            //response from server
            const server_res_obj = await response.json();

            // if authorised -> set tournament list, else -> set error value and go to login page
            if (server_res_obj.found === true) {
                setTournaments(server_res_obj.tournaments);
            } else {
                setError(server_res_obj.message);
                navigate("/login");
            }    
            
        //catch any errors
        } catch (err) {
            console.error(err.message);
        }
    }

    //Use useEffect to fetch tournaments when the component mounts
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

//Export to be used by App.js
export default DisplayDashboard;

