// Import necessary libraries and hooks
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Create a functional component called RoundsDisplay
const RoundsDisplay = () => {

    const [tournamentDetails, setTournamentDetails] = useState({});
    const [allRounds, setAllRounds] = useState([]);
    const [pairingsCollection] = useState([]);

    const [currentRound, setCurrentRound] = useState(0);

    const { tournamentId } = useParams();

    const navigate = useNavigate();

    // Fetch the tournament details function (using tournamentID)
    // Create a new round with new pairings function (using tournament type from tournamentDetails and tournamentID)
    // Fetch all rounds function (using tournamentID)
    // Fetch the pairings for a specific round function (using roundID)
    // Save the results of all pairings in a single round function (using result, pairingsID and roundID)
    // Delete last round function (using roundID)

    // Predefined pairs functionality: create a pair, view pairs, delete pairs

    return (
        <div>
            <h1>*Tournament Name*: Standings</h1>

            {tournamentDetails.status === "initialised" ? (
                <div>
                    <h2>Begin the tournament:</h2>
                    <button>Start Tournament</button>
                    <p>Once the tournament has started you will not be able to add or remove the players from the tournament</p>
                </div>
            ) : (
                <div>
                    {/* Display the round selection buttons */}
                    <div>
                        {allRounds.map((round) => (
                            <button key={round.round_id} onClick={() => setCurrentRound(round.round_id)}>Round {round.round_number}</button>
                        ))}
                    </div>

                    {/* Display the table of pairings */} 
                    <div>
                        {/*Round Table*/}
                        <table style={{ border: "1px solid black" }}>
                            <thead>
                                <tr>
                                    <th>Position</th>
                                    <th>White Player</th>
                                    <th>Rating</th>
                                    <th>Pts</th>
                                    <th>Result</th>
                                    <th>Pts</th>
                                    <th>Rating</th>
                                    <th>Black Player</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pairingsCollection.map((pairing, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{pairing.white_player_name}</td>
                                        <th>{pairing.white_player_rating}</th>
                                        <td>{pairing.white_player_points}</td>
                                        <td>
                                            <select>
                                                <option value="1">1-0</option>
                                                <option value="2">1/2-1/2</option>
                                                <option value="3">0-1</option>
                                            </select>
                                        </td>
                                        <td>{pairing.black_player_points}</td>
                                        <th>{pairing.black_player_rating}</th>
                                        <td>{pairing.black_player_name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <button>Save CSV</button>

                    </div>
                </div>  
            )}

            <div>
                <button onClick={() => navigate(`/tournament/${tournamentId}/standings`)}>Standings</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/players`)}>Players</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/rounds`)}>Rounds</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/settings`)}>Settings</button>
            </div>

        </div>
    );
};

// Export the component
export default RoundsDisplay;