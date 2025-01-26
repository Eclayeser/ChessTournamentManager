// Import necessary libraries and hooks
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";



// Functional component
const DisplayDashboard = () => {

    //variables
    const [tournaments, setTournaments] = useState([]);
    const [error, setError] = useState("");

    //react-router-dom hook
    const navigate = useNavigate();


    //Redirect to a specific tournament settings page
    const goToTournament = (tournamentId) => {
        navigate(`/tournament/${tournamentId}/settings`);
    };

    //Fetch tournaments function
    const requestTournaments = async () => {

        //get sessionID from local storage
        const sessionID = localStorage.getItem("sessionID");

        try {

            //send request to server
            const response = await fetch("http://localhost:5000/fetch-tournaments", {
                method: "GET",
                headers: { "Content-Type": "application/json", "Session-Id": sessionID  },
            });

            //response from server
            const server_resObject = await response.json();

            // if successful operation -> set tournament list
            if (server_resObject.success === true) {
                setTournaments(server_resObject.tournaments);

            //else: if session ahs expired -> set global error value and go to login page, else -> set different local error value
            } else {

                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);

                    navigate("/login");

                } else {
                    setError(server_resObject.message);
                };  
            } ;   
            
        //catch any errors
        } catch (err) {
            console.error(err.message);
        }
    }

    //trigger fetch tournaments function on component load, triggered by useEffect
    useEffect(() => {
        requestTournaments();
    } , []);
    

    //Display content
    return (
        <div>
            <h1>My Tournaments</h1>

            {/* Display error message if any */}
            {error && <p>{error}</p>}

            {/* Display list of tournaments */}
            <ul>
                {tournaments.map((tournament) => (
                    <li key={tournament.tournament_id} onClick={() => goToTournament(tournament.tournament_id)}>
                        {tournament.name}
                    </li>
                ))}
            </ul>

            {/* Button to create new tournament */}
            <button onClick={() => navigate("/create-tournament")}>Create New Tournament</button>

        </div> 
    );
};

//Export to be used by App.js
export default DisplayDashboard;

