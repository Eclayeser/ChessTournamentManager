// Import necessary libraries and hooks
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

//Import Modal component
import Modal from "./ModalTemplate";

// Create a functional component called RoundsDisplay
const RoundsDisplay = () => {

    const [tournamentDetails, setTournamentDetails] = useState({});
    const [allRounds, setAllRounds] = useState([]);
    const [allSingleRoundPairings, setAllSingleRoundPairings] = useState([]);
    const [currentRound, setCurrentRound] = useState(0);

    const [pairingsResults, setPairingsResults] = useState({});

    const [allPredefinedPairs, setAllPredefinedPairs] = useState([]);

    const { tournamentId } = useParams();

    const navigate = useNavigate();

    // Fetch the tournament details function (using tournamentID)
    const requestTournamentDetails = async () => {
        try {
            //get sessionID from localStorage
            const sessionID = localStorage.getItem("sessionID");

            //send request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/fetch-details`, {
                method: "GET",
                headers: { "Content-Type": "application/json", "Session-Id": sessionID },
            });
            //response from server
            const server_resObject = await response.json();
            

            // if authorised -> set tournament details, else -> set error value and go to login page
            if (server_resObject.success === true) {
                setTournamentDetails(server_resObject.details);
                
            } else {

                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                } else {
                    console.log(server_resObject.message);
                };
            };

        //catch any errors
        } catch (err) {
            console.error(err.message);
        };
    };   
    
    // Create a new round with new pairings function (using tournament type from tournamentDetails and tournamentID)
    const createNewRound = async () => {
        try {
            //get sessionID from localStorage
            const sessionID = localStorage.getItem("sessionID");

            const body = { result_object: pairingsResults };

            //send request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/create-round`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Session-Id": sessionID },
                body: JSON.stringify(body),
            });

            //response from server
            const server_resObject = await response.json();

            // if authorised -> set all rounds, else -> set error value and go to login page
            if (server_resObject.success === true) {
                fetchAllRounds();
                fetchSingleRoundPairings(server_resObject.round_id);

            } else {
                
                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                } else {
                    console.log(server_resObject.message);
                }
            };

        //catch any errors
        } catch (err) {
            console.error(err.message);
        };
    };



    // Fetch all rounds function (using tournamentID)
    const fetchAllRounds = async () => {
        try {   
            //get sessionID from localStorage
            const sessionID = localStorage.getItem("sessionID");
            
            //send request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/fetch-rounds`, {
                method: "GET",
                headers: { "Content-Type": "application/json", "Session-Id": sessionID },
            });
            //response from server
            const server_resObject = await response.json();

            // if authorised -> set all rounds, else -> set error value and go to login page
            if (server_resObject.success === true) {
                setAllRounds(server_resObject.rounds);

            } else {
                
                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                } else {
                    console.log(server_resObject.message);
                };
            };

        //catch any errors
        } catch (err) {
            console.error(err.message);
        };
    };


    // Fetch the pairings for a specific round function (using roundID)
    const fetchSingleRoundPairings = async (currentRound) => {
        try {
            //get sessionID from localStorage
            const sessionID = localStorage.getItem("sessionID");

            //send request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/fetch-round-pairings/${currentRound}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", "Session-Id": sessionID },
            });
            //response from server
            const server_resObject = await response.json();

            // if authorised -> set all pairings for the round, else -> set error value and go to login page
            if (server_resObject.success === true) {
                setAllSingleRoundPairings(server_resObject.pairings);
                setCurrentRound(currentRound);

            } else {

                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                } else {
                    console.log(server_resObject.message);
                };
            };

        //catch any errors
        } catch (err) {
            console.error(err.message);
        };
    };

    // Save the results of all pairings in a single round function (using result, pairingsID and roundID)
    // Delete last round function (using roundID)

    // Predefined pairs functionality: create a pair, view pairs, delete pairs
    const fetchPredefinedPairs = async () => {
        try {
            //get sessionID from localStorage
            const sessionID = localStorage.getItem("sessionID");

            //send request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/fetch-predefined-pairs`, {
                method: "GET",
                headers: { "Content-Type": "application/json", "Session-Id": sessionID },
            });
            //response from server
            const server_resObject = await response.json();

            // if authorised -> set all predefined pairs, else -> set error value and go to login page
            if (server_resObject.success === true) {
                setAllPredefinedPairs(server_resObject.predefined_pairs);

            } else {

                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                } else {
                    console.log(server_resObject.message);
                };
            };

        //catch any errors
        } catch (err) {
            console.error(err.message);
        };
    };

    const startTournament = async () => {
        try {
            //get sessionID from localStorage
            const sessionID = localStorage.getItem("sessionID");

            //send request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/start`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Session-Id": sessionID },
            });
            //response from server
            const server_resObject = await response.json();

            // if authorised -> set tournament details, else -> set error value and go to login page
            if (server_resObject.success === true) {
                requestTournamentDetails();

            } else {

                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                } else {
                    console.log(server_resObject.message);
                };
            };

        //catch any errors
        } catch (err) {
            console.error(err.message);
        };
    };

    // Set the result of a pairing function (using pairingID and result)
    const setResult = (pairingID, result) => {
        setPairingsResults({...pairingsResults, [pairingID]: result});
        console.log(pairingsResults);
    };

    useEffect(() => {
        //fetch data
        requestTournamentDetails();
        fetchAllRounds();
    }, []);


    return (
        <div>
            <h1>{tournamentDetails.name}: Rounds</h1>

            {tournamentDetails.status === "initialised" ? (
                <div>
                    <h2>Begin the tournament:</h2>
                    <button onClick={() => startTournament()}>Start Tournament</button>
                    <p>Once the tournament has started you will not be able to add or remove the players from the tournament</p>
                </div>
            ) : (
                <div>
                    {/* Display the round selection buttons */}
                    <div>
                        {allRounds.map((round) => (
                            <button key={round.round_id} onClick={() => fetchSingleRoundPairings(round.round_id)}>Round {round.round_number}</button>
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
                                    {tournamentDetails.hide_rating ? (null):(<th>Rating</th>)}
                                    <th>Pts</th>
                                    <th>Result</th>
                                    <th>Pts</th>
                                    {tournamentDetails.hide_rating ? (null):(<th>Rating</th>)}
                                    <th>Black Player</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allSingleRoundPairings.map((pairing, index) => (
                                    <tr key={pairing.pairing_id}>
                                        <td>{index + 1}</td>
                                        <td>{pairing.white_player_name}</td>
                                        {tournamentDetails.hide_rating ? (null):(<th>{pairing.white_player_rating}</th>)}
                                        <td>{pairing.white_player_points}</td>

                                        {currentRound === allRounds[allRounds.length - 1].round_id ? (
                                            pairing.result === "bye" ? (
                                                <td>{pairing.result}</td>
                                            ) : (
                                                <td>
                                                    <select value={pairingsResults.round_id} onChange={(e) => setResult(pairing.pairing_id, e.target.value)}>
                                                        <option value="-">-</option>
                                                        <option value="1-0">1-0</option>
                                                        <option value="1/2-1/2">1/2-1/2</option>
                                                        <option value="0-1">0-1</option>
                                                    </select>
                                                </td>
                                            )
                                        ) : (
                                            <td>{pairing.result}</td>
)}
                                        
                                        <td>{pairing.black_player_points}</td>
                                        {tournamentDetails.hide_rating ? (null):(<th>{pairing.black_player_rating}</th>)}
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