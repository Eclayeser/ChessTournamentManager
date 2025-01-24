import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";

const DisplayPlayers = () => {

    const [players, setPlayers] = useState([]);
    const [tournamentName, setTournamentName] = useState("");
    const { tournamentId } = useParams();
    const navigate = useNavigate();

    const fetchPlayers = async () => {
        try {
            const sessionID = localStorage.getItem("sessionID");

            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/players`, {
                method: "GET",
                headers: { "Content-Type": "application/json", "Session-Id": sessionID },
            });
            
            //response from server
            const server_resObject = await response.json();

            if (server_resObject.success === true) {
                setPlayers(server_resObject.players);
                setTournamentName(server_resObject.tournament.name);
            } else {
                localStorage.removeItem("sessionID");
                localStorage.setItem("globalMessage", server_resObject.message);
                navigate("/login");
            }

        //catch any errors
        } catch (err) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        fetchPlayers();
    }, [tournamentId]);

    return (
        <div>
            <h2>{tournamentName}: Players</h2>

            <div>
                <button>Add Player</button>
                <button>Forbidden Pairs</button>
                <table style={{ border: "1px solid black" }}>
                    <thead>
                        <tr>
                            <th>№</th>
                            <th>Name</th>
                            <th>Rating</th>
                            <th>Total Points</th>
                            <th>Add. Points</th>
                            <th>Club</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((player, index) => (
                            <tr key={player.player_id}>
                                <td>{index + 1}</td>
                                <td>{player.name}</td>
                                <td>{player.rating}</td>
                                <td>*total points*</td>
                                <td>{player.add_points}</td>
                                <td>{player.club}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button>Save CSV</button>
            </div>

            <div>
                <button>Standings</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/players`)}>Players</button>
                <button>Rounds</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/settings`)}>Settings</button>
            </div>
        </div>
    );
}

export default DisplayPlayers;