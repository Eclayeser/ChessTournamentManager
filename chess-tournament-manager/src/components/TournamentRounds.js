// Import necessary libraries and hooks
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { saveAs } from 'file-saver'; 

//Import Modal component
import Modal from "./ModalTemplate";


// Create a functional component called RoundsDisplay
const RoundsDisplay = () => {

    const [tournamentDetails, setTournamentDetails] = useState({});


    const [allRounds, setAllRounds] = useState([]);
    const [lastRoundNumber, setLastRoundNumber] = useState(0);

    const [allSingleRoundPairings, setAllSingleRoundPairings] = useState([]);
    
    const [currentRoundNumber, setCurrentRoundNumber] = useState(0);

    const [pairingsResults, setPairingsResults] = useState({});

    const { tournamentId } = useParams();

    const [error, setError] = useState("");

    const navigate = useNavigate();

    //Finish Tournament Confirmation Modal
    const [isModalOpenFinishConf, setIsModalOpenFinishConf] = useState(false);

    const openModalFinishConf = () => {
        setIsModalOpenFinishConf(true);
    };

    const closeModalFinishConf = () => {
        setIsModalOpenFinishConf(false);
    };

    // Fetch the tournament details function (using tournamentID)
    const requestTournamentDetails = async () => {
        try {

            //send request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/fetch-details`, {
                method: "GET",
                headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
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
    
    // Save the results of all pairings in a single round function (using result, pairingsID and roundID), Create a new round with new pairings function (using tournament type from tournamentDetails and tournamentID)
    const createNewRound = async () => {
        setError("");
        console.log(pairingsResults);

        try {

            const body = { results_object: pairingsResults };

            //send request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/create-round`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
                body: JSON.stringify(body),
            });
            //response from server
            const server_resObject = await response.json();

            // if authorised -> set all rounds, else -> set error value and go to login page
            if (server_resObject.success === true) {
                fetchAllRounds();
                fetchSingleRoundPairings(server_resObject.round_id);
                setCurrentRoundNumber(server_resObject.round_number);
                setPairingsResults({});

                console.log("--------------------");
                console.log("server_resObject.round_id: ", server_resObject.round_id);
                console.log("server_resObject.round_number: ", server_resObject.round_number);
                console.log("Pairings:", server_resObject.pairings);
                console.log("--------------------");

            } else {
                
                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                } else {
                    setError(server_resObject.message);
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

            //send request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/fetch-rounds`, {
                method: "GET",
                headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
            });
            //response from server
            const server_resObject = await response.json();

            // if authorised -> set all rounds, else -> set error value and go to login page
            if (server_resObject.success === true) {
                setAllRounds(server_resObject.rounds); // [{round_id: *num*, tournament_id: *num*, round_number: *num*}, ...]

                if (server_resObject.rounds.length > 0){
                    setLastRoundNumber(server_resObject.rounds[server_resObject.rounds.length - 1].round_number); // *num*
                };

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
            console.error(err);
        };
    };


    // Fetch the pairings for a specific round function (using roundID)
    const fetchSingleRoundPairings = async (currentRoundID) => {
        setError("");
        
        try {
         
            //send request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/fetch-round-pairings/${currentRoundID}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
            });
            //response from server
            const server_resObject = await response.json();

            // if authorised -> set all pairings for the round, else -> set error value and go to login page
            if (server_resObject.success === true) {
                setAllSingleRoundPairings(server_resObject.pairings); // [{pairing_id: *num*, round_id: *num*, white_player_id: *num*, black_player_id: *num*, result: *str*, ...}, ...]
                setCurrentRoundNumber(server_resObject.round_number); // *num*



                //set pairingsResult to have "-" for all pairings except the bye ones if the current round is the last round
                if (server_resObject.round_number === server_resObject.last_round_number) {
                    const resultObject = {};
                    server_resObject.pairings.forEach(pairing => {
                        if (pairing.result !== "bye") {
                            resultObject[pairing.pairing_id] = pairing.result;
                        };
                    });
                    setPairingsResults(resultObject);
                };

                console.log("--------------------");
                console.log("All pairings: ", server_resObject.pairings);
                console.log("Current round number: ", server_resObject.round_number);
                console.log("Last round number: ", lastRoundNumber);
                console.log("Last round pairings results: ", pairingsResults);
                console.log("--------------------");


            } else {

                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                } else {
                    setError(server_resObject.message);
                };
            };

        //catch any errors
        } catch (err) {
            console.error(err.message);
        };
    };

    // Delete last round pairings function
    const deleteLastRoundPairings = async () => {
        setError("");

        try {

            //send request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/delete-last-round`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
            });
            //response from server
            const server_resObject = await response.json();

            // if authorised -> set all rounds, else -> set error value and go to login page
            if (server_resObject.success === true) {

                fetchAllRounds();

                if (server_resObject.no_rounds_left === false) {
                    //fetchSingleRoundPairings(server_resObject.round_id);
                    setLastRoundNumber(server_resObject.last_round_number);
                    if (server_resObject.last_round_number === currentRoundNumber-1) {
                        fetchSingleRoundPairings(server_resObject.last_round_id);
                        currentRoundNumber(server_resObject.last_round_number);
                    };
                } else {
                    setAllSingleRoundPairings([]);
                    setCurrentRoundNumber(0);
                    setLastRoundNumber(0);
                };
                
                console.log("--------------------");
                console.log("server_resObject.no_rounds_left: ", server_resObject.no_rounds_left);
                console.log("server_resObject.last_round_number: ", server_resObject.last_round_number);
                console.log("server_resObject.last_round_id: ", server_resObject.last_round_id);
                console.log("Last round number: ", lastRoundNumber);
                console.log("Current round number: ", currentRoundNumber);
                console.log("--------------------");

            } else {

                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                } else {
                    setError(server_resObject.message);
                };
            };

        //catch any errors
        } catch (err) {
            console.error(err.message);
        };
    }

    //Save CSV
    const saveCSV = () => {
            //convert table to csv
            const rows = document.querySelectorAll("table tr");
            let csvContent = "";
    
            rows.forEach(row => {
                const cols = row.querySelectorAll("td, th");
                const rowData = Array.from(cols).map(col => col.innerText).join(",");
                csvContent += rowData + "\n";
            });
    
            //download csv file
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            saveAs(blob, `tournament_round_${currentRoundNumber}.csv`);
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

    const finishTournament = async () => {
        try {
            //get sessionID from localStorage
            const sessionID = localStorage.getItem("sessionID");

            const body = { results_object: pairingsResults };

            //send request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/finish`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Session-Id": sessionID },
                body: JSON.stringify(body),
            });
            //response from server
            const server_resObject = await response.json();

            // if authorised -> set tournament details, else -> set error value and go to login page
            if (server_resObject.success === true) {
                requestTournamentDetails();
                fetchSingleRoundPairings(allRounds[allRounds.length - 1].round_id);
                closeModalFinishConf();
                setError("");

            } else {

                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                } else {
                    closeModalFinishConf();
                    setError(server_resObject.message);
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
    };

    useEffect(() => {
        //fetch data
        requestTournamentDetails();
        fetchAllRounds();
    }, []);


    return (
        <div>
            <h1>{tournamentDetails.name}: Rounds</h1>

            {(currentRoundNumber === 0 && tournamentDetails.status !== "initialised") ? (
                <h2>Generate new round OR select from existing rounds</h2>
            ) : (null)}

            {allRounds === null ? (
                    <button onClick={createNewRound}>Generate next round</button>
                ) : (null)}

            {/* Dynamic Error Message */}
            {error && <p style={{color: "red"}}>{error}</p>}

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

                    <div>
                        {/**onClick={createNewRound} */}
                        {(currentRoundNumber === lastRoundNumber && tournamentDetails.status !== "finished") ? (
                            <button onClick={createNewRound}>Generate Next Round</button>
                        ) : (null)}
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

                                        {currentRoundNumber === allRounds[allRounds.length - 1].round_number ? (
                                            pairing.result === "bye" ? (
                                                <td>{pairing.result}</td>
                                            ) : (
                                                tournamentDetails.status === "finished" ? (
                                                    <td>{pairing.result}</td>
                                                ) : (
                                                <td>
                                                    <select onChange={(e) => setResult(pairing.pairing_id, e.target.value)}>
                                                        <option value = {pairing.result} selected disabled hidden>{pairing.result}</option>
                                                        <option value="-">-</option>
                                                        <option value="1-0">1-0</option>
                                                        <option value="1/2-1/2">1/2-1/2</option>
                                                        <option value="0-1">0-1</option>
                                                    </select>
                                                </td>
                                            ))
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

                        <button onClick={saveCSV}>Save CSV</button>

                        <br></br>
                        {(currentRoundNumber === lastRoundNumber && tournamentDetails.status !== "finished") ? (
                            <button onClick={openModalFinishConf}>Finish Tournament</button>
                        ) : (null)}

                        {(currentRoundNumber === 0 || tournamentDetails.status === "finished") ? (null) : (
                            <button onClick={deleteLastRoundPairings}>Delete Last Round</button>
                        )}

                    </div>
                </div>  
            )}

            <div>
                <button onClick={() => navigate(`/tournament/${tournamentId}/standings`)}>Standings</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/players`)}>Players</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/rounds`)}>Rounds</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/settings`)}>Settings</button>
            </div> 

            {/* Finish Tournament Confirmation Pop-up */}
            <Modal isOpen={isModalOpenFinishConf} onClose={closeModalFinishConf} title="Finish This Tournament">
                
                <h3>Are you sure you want to finish this tournament tournament?</h3>
                <p> No more rounds will be generated or deleted.</p>
                <button onClick={finishTournament}>Confirm</button>
                <button onClick={closeModalFinishConf}>Cancel</button>

            </Modal>  

        </div>
    );
};

// Export the component
export default RoundsDisplay;