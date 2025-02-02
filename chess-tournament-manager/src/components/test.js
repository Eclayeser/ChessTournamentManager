//Import neccessary libraries and hooks
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";

//Import Modal component
import Modal from "./ModalTemplate";

//Functional component
const DisplayPlayers = () => {

    //variables
    const [listPlayersTable, setListPlayersTable] = useState([]); 

    const [tournamentDetails, setTournamentDetails] = useState({}); 

    const [forbiddenPairs, setForbiddenPairs] = useState([]);
    const [predefinedPairs, setPredefinedPairs] = useState([]);

    const [player1ID, setPlayer1ID] = useState("");
    const [player2ID, setPlayer2ID] = useState("");

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const { tournamentId } = useParams();

    //react-router-dom hooks
    const navigate = useNavigate();

    //Forbidden Pairs Modal
    const [isModalOpenForbPairs, setIsModalOpenForbPairs] = useState(false);

    const openModalForbPairs = () => {
        fetchSpecialPairs("forbidden");
        setIsModalOpenForbPairs(true);

        setError("");
    };

    const closeModalForbPairs = () => {
        setIsModalOpenForbPairs(false);

        setError("");
    };

    
    //Add Frobidden Pair Modal
    const [isModalOpenAddForbPair, setIsModalOpenAddForbPair] = useState(false);


    const openModalAddForbPair = () => {
        setIsModalOpenAddForbPair(true);
        closeModalForbPairs();
    };

    const closeModalAddForbPair = () => {
        setIsModalOpenAddForbPair(false);
        openModalForbPairs();
    };
    
    
    //Predefined Pairs Modal
    const [isModalOpenPredPairs, setIsModalOpenPredPairs] = useState(false);

    const openModalPredPairs = () => {
        fetchSpecialPairs("predefined");
        setIsModalOpenPredPairs(true);

        setError("");
    };

    const closeModalPredPairs = () => {
        setIsModalOpenPredPairs(false);

        setError("");
    };


    //Add Frobefined Pair Modal
    const [isModalOpenAddPredPair, setIsModalOpenAddPredPair] = useState(false);


    const openModalAddPredPair = () => {
        setIsModalOpenAddPredPair(true);
        closeModalPredPairs();
    };

    const closeModalAddPredPair = () => {
        setIsModalOpenAddPredPair(false);
        openModalPredPairs();
    };



    //Fetch tournament details function
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
                    setError(server_resObject.message);
                };
            };

        //catch any errors
        } catch (err) {
            console.error(err.message);
        };
    };

    const fetchPlayers = async () => {
        try {
            const sessionID = localStorage.getItem("sessionID");

            //send request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/players`, {
                method: "GET",
                headers: { "Content-Type": "application/json", "Session-Id": sessionID },
            });
            
            //response from server
            const server_resObject = await response.json();

            if (server_resObject.success === true) {

                if (server_resObject.players.length !== 0) {
                    setListPlayersTable(server_resObject.players);

                    setPlayer1ID(Number(server_resObject.players[0].player_id));
                    setPlayer2ID(Number(server_resObject.players[0].player_id));
                };
                
            } else {

                // if session expired -> remove sessionID and go to login page, else -> set error value
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
        }
    };


    const fetchSpecialPairs = async (type) => {
        try {
            const sessionID = localStorage.getItem("sessionID");

            //send request to server
            let response = null;
            if (type === "forbidden") {
                response = await fetch(`http://localhost:5000/tournament/${tournamentId}/fetch-forbidden-pairs`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json", "Session-Id": sessionID },
                });

            } else if (type === "predefined") {
                response = await fetch(`http://localhost:5000/tournament/${tournamentId}/fetch-predefined-pairs`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json", "Session-Id": sessionID },
                });
            };

            //response from server
            if (response === null) {
                return;
            }
            const server_resObject = await response.json();

            // if successful -> set special pairs
            if (server_resObject.success === true) {
                if (type === "forbidden") {
                    setForbiddenPairs(server_resObject.forbidden_pairs);
                } else if (type === "predefined") {
                    setPredefinedPairs(server_resObject.predefined_pairs);
                };

            } else {

                // if session expired -> remove sessionID and go to login page, else -> set error value
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

    const removeSpecialPair = (pair_id, type) => async () => {
        
        try {
            const sessionID = localStorage.getItem("sessionID");
            const body = { pair_id: pair_id };

            //send request to server
            let response = null;
            if (type === "forbidden") {
                response = await fetch(`http://localhost:5000/tournament/${tournamentId}/remove-forbidden-pair`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", "Session-Id": sessionID },
                    body: JSON.stringify(body),
                });

            } else if (type === "predefined") {
                response = await fetch(`http://localhost:5000/tournament/${tournamentId}/remove-predefined-pair`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", "Session-Id": sessionID },
                    body: JSON.stringify(body),
                });
            };

            //response from server
            if (response === null) {
                return;
            };
            const server_resObject = await response.json();


            // if operation successful -> set tournament details
            if (server_resObject.success === true) {
                fetchSpecialPairs(type);

            } else {

                // if session expired -> remove sessionID and go to login page, else -> set error value
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
           

    const addSpecialPair = async (type) => {
        setError("");

         try{
            const sessionID = localStorage.getItem("sessionID");

            const body = {
                player_1_id: player1ID,
                player_2_id: player2ID
            }

            //send request to server
            let response = null;
            if (type === "forbidden") {
                response = await fetch(`http://localhost:5000/tournament/${tournamentId}/add-forbidden-pair`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", "Session-Id": sessionID },
                    body: JSON.stringify(body),
                });
                
            } else if (type === "predefined") {
                response = await fetch(`http://localhost:5000/tournament/${tournamentId}/add-predefined-pair`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", "Session-Id": sessionID },
                    body: JSON.stringify(body),
                });
            };

            //response from server
            if (response === null) {
                return;
            };
            const server_resObject = await response.json();

            if (server_resObject.success === true) {
                if (type === "forbidden") {
                    closeModalAddForbPair();
                } else if (type === "predefined") {
                    closeModalAddPredPair();
                };
                fetchSpecialPairs(type);

            } else {
                // if session expired -> remove sessionID and go to login page, else -> set error value
                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                }
                
                else {
                    setError(server_resObject.message);
                }
            }

        //catch any errors
        } catch (err) {
            console.error(err.message);
        }
    };


    //fetch tournament details on page load and clear error and success messages, triggered by useEffect
    useEffect(() => {
        requestTournamentDetails();
        fetchPlayers();
        setError("");
    }, []);

    //Display the component
    return (
        <div>
            <h2>{tournamentDetails.name}: Players</h2>

            {successMessage && <p style={{color:'green'}}>{successMessage}</p>}

            <div>
                <button onClick={openModalForbPairs}>Forbidden Pairs</button>
                <button onClick={openModalPredPairs}>Predefined Pairs</button>
            </div>

            <div>
                <button onClick={() => navigate(`/tournament/${tournamentId}/standings`)}>Standings</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/players`)}>Players</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/rounds`)}>Rounds</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/settings`)}>Settings</button>
            </div>


            {/* Forbidden Pairs Modal */}
            <Modal isOpen={isModalOpenForbPairs} onClose={closeModalForbPairs} title="Forbidden Pairs">
                
                <table>
                    <thead>
                        <tr>
                            <th>Num</th>
                            <th>Player 1</th>
                            <th>Player 2</th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {forbiddenPairs.map((forbPair, index) => (
                            <tr key={forbPair.pair_id}>
                                <td>{index + 1}</td>
                                <td>{forbPair.player_1_name}</td>
                                <td>{forbPair.player_2_name}</td>
                                <td><button onClick={removeSpecialPair(forbPair.pair_id, "forbidden")}>Remove Pair</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button onClick={openModalAddForbPair}>Add Pair</button>

            </Modal>


            {/* Add Forbidden Pair Modal */}
            <Modal isOpen={isModalOpenAddForbPair} onClose={closeModalAddForbPair} title="Add a Pair" errorDisplay={error}>
                
                 <label> Player 1:
                    <select value={player1ID} onChange={(e) => setPlayer1ID(Number(e.target.value))} required>
                        {listPlayersTable.map((player) => (
                            <option key={player.player_id} value={player.player_id}>{player.name}</option>
                        ))}
                    </select>
                </label>

                <label> Player 2:
                    <select value={player2ID} onChange={(e) => setPlayer2ID(Number(e.target.value))} required>
                        {listPlayersTable.map((player) => (
                            <option key={player.player_id} value={player.player_id}>{player.name}</option>
                        ))}
                    </select>
                </label>
                
                <button onClick={addSpecialPair("forbidden")}>Add</button>

            </Modal>

            {/* Predefined Pairs Modal */}
            <Modal isOpen={isModalOpenPredPairs} onClose={closeModalPredPairs} title="Predefined Pairs">
                
            <table>
                <thead>
                    <tr>
                        <th>Num</th>
                        <th>Player 1</th>
                        <th>Player 2</th>
                        <th></th>
                    </tr>
                </thead>
            
                <tbody>
                    {predefinedPairs.map((predPair, index) => (
                        <tr key={predPair.pair_id}>
                            <td>{index + 1}</td>
                            <td>{predPair.player_1_name}</td>
                            <td>{predPair.player_2_name}</td>
                            <td><button onClick={removeSpecialPair(predPair.pair_id, "predefined")}>Remove Pair</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <button onClick={openModalAddPredPair}>Add Pair</button>
            
            </Modal>
            
            
            {/* Add Predefined Pair Modal */}
            <Modal isOpen={isModalOpenAddPredPair} onClose={closeModalAddPredPair} title="Add a Pair" errorDisplay={error}>
            
                <label> Player 1:
                    <select value={player1ID} onChange={(e) => setPlayer1ID(Number(e.target.value))} required>
                        {listPlayersTable.map((player) => (
                            <option key={player.player_id} value={player.player_id}>{player.name}</option>
                        ))}
                    </select>
                </label>

                <label> Player 2:
                <select value={player2ID} onChange={(e) => setPlayer2ID(Number(e.target.value))} required>
                    {listPlayersTable.map((player) => (
                        <option key={player.player_id} value={player.player_id}>{player.name}</option>
                    ))}
                </select>
                </label>

                <button onClick={addSpecialPair("predefined")}>Add</button>
            
            </Modal>

        </div>
    );
};

export default DisplayPlayers;