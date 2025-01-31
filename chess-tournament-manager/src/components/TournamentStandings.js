//Import neccessary libraries and hooks
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const DisplayStandings = () => {

    const navigate = useNavigate();

    const { tournamentId } = useParams();

    //test variables
    const tournamentName = "Tournament Name";
    const hideRating = true;
    const roundColumns = [1, 2, 3, 4, 5];
    const standings = [
        { player_name: "Player 1", player_rating: 1200, points: 5, rounds_result: ["L", "L", "W", "W", "L"], tiebreak_points: 22 },
        { player_name: "Player 2", player_rating: 1300, points: 5, rounds_result: ["W", "W", "W", "W", "L"], tiebreak_points: 20 },
        { player_name: "Player 3", player_rating: 1100, points: 3, rounds_result: ["L", "L", "L", "L", "W"], tiebreak_points: 10 },
        { player_name: "Player 4", player_rating: 1400, points: 2, rounds_result: ["W", "W", "W", "W", "W"], tiebreak_points: 25 },
        { player_name: "Player 5", player_rating: 1000, points: 1, rounds_result: ["L", "L", "L", "L", "W"], tiebreak_points: 5 },
    ];

    const fetchStandings = async () => {
        try{
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/standings`, {
                method: "GET",
                headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
            });
            const server_resObject = await response.json();

        } catch (err) {
            console.error(err.message);
        };
    };

    useEffect(() => {
        //fetch data
        fetchStandings();
    }, []);

    //Display the component
    return (
        <div>
            <h2>{tournamentName}: Standings</h2>

            <div>

                {/*Table of Players*/}
                <table style={{ border: "1px solid black" }}>
                    <thead>
                        <tr>
                            <th>Position</th>
                            <th>Name</th>
                            { hideRating ? null : <th>Rating</th> }
                            <th>Points</th>
                            {roundColumns.map((col, index) => (
                                <th key={index}>{col}</th>
                            ))}
                            <th>Tie Break Pts.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standings.map((section, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{section.player_name}</td>
                                { hideRating ? null : <th>{section.player_rating}</th> }
                                <td>{section.points}</td>
                                {section.rounds_result.map((result, index) => (
                                    <th key={index}>{result}</th>
                                ))}
                                <td>{section.tiebreak_points}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button>Save CSV</button>

            </div>

            <div>
                <button onClick={() => navigate(`/tournament/${tournamentId}/standings`)}>Standings</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/players`)}>Players</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/rounds`)}>Rounds</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/settings`)}>Settings</button>
            </div>

        </div>


    );
}

export default DisplayStandings;
