// Import React lib and react-router-dom library components

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";


// Functional component
const TournamentDetails = () => {

    // Get tournament ID from URL parameters
    const { tournamentId } = useParams();

    //variables
    const [tournament, setTournament] = useState(null);

    const navigate = useNavigate();

    //Fetch tournament details function
    const requestTournamentDetails = async () => {
        try {
            //fetch request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            //response from server
            const server_res_obj = await response.json();

            // if authorised -> set tournament details, else -> set error value and go to login page
            if (server_res_obj.success=== true) {
                setTournament(server_res_obj.tournament_details);
            } else {
                navigate("/login");
            }

        //catch any errors
        } catch (err) {
            console.error(err.message);
        }
    };

    //Use useEffect to fetch tournament details when the component mounts
    useEffect(() => {
        requestTournamentDetails();
    }, [tournamentId]);

    //Display content
    return (
        <div>
            {tournament ? (
                <div>
                    <h1>{tournament.name}</h1>
                    <p>Type: {tournament.type}</p>
                    <p>Number of Rounds: {tournament.num_rounds}</p>
                    <p>Max Players: {tournament.max_players}</p>
                    <p>Bye Value: {tournament.bye_value}</p>
                    <p>Tie Break: {tournament.tie_break}</p>
                    <p>Hide Rating: {tournament.hide_rating ? "Yes" : "No"}</p>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default TournamentDetails;
