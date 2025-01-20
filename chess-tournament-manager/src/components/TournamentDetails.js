// Import React lib and react-router-dom library components
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";

//Import AppContext
import { AppContext } from "./AppContext";

// Functional component
const TournamentDetails = () => {

    //global variables
    const { username, setUsername, password, setPassword } = useContext(AppContext);
    console.log("Client:", username, password);
    // Get tournament ID from URL parameters
    const { tournamentId } = useParams();

    //variables
    const [tournament, setTournament] = useState(null);

    const navigate = useNavigate();

    const requestTournamentDetails = async () => {
        try {
            
            const body = { givenUsername: username, givenPassword: password };

            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const tournament_obj = await response.json();

            if (tournament_obj.found === true) {
                setTournament(tournament_obj.tournament);
            } else {
                console.log("Unauthorised");
                navigate("/login");
            }

        } catch (err) {
            console.error(err.message);
        }
    };

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