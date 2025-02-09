//Import neccessary libraries and hooks
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { saveAs } from 'file-saver'; 

//Import Modal component
import Modal from "./ModalTemplate";


//Functional component
const DisplayPlayers = () => {

    //variables
    const [listPlayersTable, setListPlayersTable] = useState([]); 

    const [tournamentDetails, setTournamentDetails] = useState({}); 

    const [forbiddenPairs, setForbiddenPairs] = useState([]);
    const [predefinedPairs, setPredefinedPairs] = useState([]);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [club, setClub] = useState("");
    const [rating, setRating] = useState(0);
    const [addPoints, setAddPoints] = useState(0);
    const [eliminated, setEliminated] = useState(false);
    const [createdBy, setCreatedBy] = useState(0);

    const [existingEmail, setExistingEmail] = useState("");

    const [editPlayerId, setEditPlayerId] = useState(null);

    const [player1ID, setPlayer1ID] = useState("");
    const [player2ID, setPlayer2ID] = useState("");

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const { tournamentId } = useParams();

    //react-router-dom hooks
    const navigate = useNavigate();

    

    //Add Player Modal
    const [isModalOpenAddPlayer, setIsModalOpenAddPlayer] = useState(false);

    const openModalAddPlayer = () => {
        emptyPlayerDetails();
        setIsModalOpenAddPlayer(true);

        setError("");
        setSuccessMessage("");
    };

    const closeModalAddPlayer = () => {
        setIsModalOpenAddPlayer(false);

        setError("");
    };

    
    //Edit Player Modal
    const [isModalOpenEditPlayer, setIsModalOpenEditPlayer] = useState(false);

    const openModalEditPlayer = () => {
        setIsModalOpenEditPlayer(true);

        setError("");
    };

    const closeModalEditPlayer = () => {
        setIsModalOpenEditPlayer(false);
        setEditPlayerId(null);

        setError("");
    };

    
    //Remove Confirmation Modal
    const [isModalOpenRemConf, setIsModalOpenRemConf] = useState(false);

    const openModalRemConf = () => {
        setIsModalOpenRemConf(true);
        setIsModalOpenEditPlayer(false);

        setError("");
    };

    const closeModalRemConf = () => {
        setIsModalOpenRemConf(false);
        setIsModalOpenEditPlayer(true);

        setError("");
    };

    
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

    

    

    const fillPlayerDetails = (player) => {
        setName(player.name);
        setEmail(player.email);
        setClub(player.club);
        setRating(player.rating);
        setAddPoints(player.additional_points);
        setEliminated(player.eliminated);
        setCreatedBy(player.created_by)
    };

    const emptyPlayerDetails = () => {
        setName("");
        setEmail("");
        setClub("");
        setRating(0);
        setAddPoints(0);
        setEliminated(null);
        setCreatedBy(0);

        setExistingEmail("");
    };

    //Fetch tournament details function
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
            //send request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/players`, {
                method: "GET",
                headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
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

    
    const createNewPlayer = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        try {
            //object to be sent to server
            const body = {
                name: name,
                rating: rating,
                club: club,
                email: email,
                additional_points: addPoints
            }

            console.log(body);
            //fetch request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/create-player`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
                body: JSON.stringify(body),
            });
            //response from server
            const server_resObject = await response.json();
            console.log(server_resObject);
            // if operation successful -> set tournament details
            if (server_resObject.success === true) {
                closeModalAddPlayer();
                setSuccessMessage(server_resObject.message);
                fetchPlayers();
                emptyPlayerDetails();

            // if session expired -> remove sessionID and go to login page, else -> set error value
            } else {
            
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


    const addExistingPlayer = async () => {
        setError("");
        setSuccessMessage("");

        //check if the number of players has reached the maximum
        if (listPlayersTable.length >= tournamentDetails.max_participants) {
            setError("The maximum number of players has been reached.");
            return;
        }

        try {
            const sessionID = localStorage.getItem("sessionID");

            const body = { email: existingEmail };
            //fetch request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/add-existing-player`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Session-Id": sessionID },
                body: JSON.stringify(body),
            });
            //response from server
            const server_resObject = await response.json();
            
            // if authorised -> set tournament details, else -> set error value and go to login page
            if (server_resObject.success === true) {
                setSuccessMessage(server_resObject.message);
                fetchPlayers();
                closeModalAddPlayer();

            } else {
                // create could not happen due to session expiration
                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                }
                // create failed due to server error
                else {
                    setError(server_resObject.message);
                }
            }

        //catch any errors
        } catch (err) {
            console.error(err.message);
        }
    };
    
    
    const selectPlayer = async (playerId) => {
        try {

            const sessionID = localStorage.getItem("sessionID");
            //object to be sent to server
            const body = { player_id: playerId };

            //fetch request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/fetch-player-details`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Session-Id": sessionID },
                body: JSON.stringify(body),
            });
            
            //response from server
            const server_resObject = await response.json();

            // if operation successful -> set player details and open modal
            if (server_resObject.success === true) {

                fillPlayerDetails(server_resObject.player);
                setEditPlayerId(playerId);
                openModalEditPlayer();

               
            // if session expired -> remove sessionID and go to login page, else -> set error value
            } else {

                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                
                } else {
                    setError(server_resObject.message);
                }
            }

        //catch any errors
        } catch (err) {
            console.error(err.message);
        }
    };

    
    const editPlayerDetails = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        try {
            const sessionID = localStorage.getItem("sessionID");

            const body = {
                player_id: editPlayerId,
                name: name,
                rating: rating,
                club: club,
                additional_points: addPoints,
                created_by: createdBy
            }
            //fetch request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/edit-player-details`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Session-Id": sessionID },
                body: JSON.stringify(body),
            });
            //response from server
            const server_resObject = await response.json();
            
            // if authorised -> set tournament details, else -> set error value and go to login page
            if (server_resObject.success === true) {
                setSuccessMessage(server_resObject.message);
                fetchPlayers();
            } else {
                // create could not happen due to session expiration
                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                }
                // create failed due to server error
                else {
                    setError(server_resObject.message);
                }
            }

        //catch any errors
        } catch (err) {
            console.error(err.message);
        }
    };
    

    
    const removePlayer = async () => {
        setError("");
        setSuccessMessage("");

        try {
            const sessionID = localStorage.getItem("sessionID");

            const body = {
                player_id: editPlayerId
            }
            //fetch request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/remove-player`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", "Session-Id": sessionID },
                body: JSON.stringify(body),
            });
            //response from server
            const server_resObject = await response.json();
            
            // if authorised -> set tournament details, else -> set error value and go to login page
            if (server_resObject.success === true) {
                fetchPlayers();
                setIsModalOpenRemConf(false);

            } else {
                // create could not happen due to session expiration
                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                }
                // create failed due to server error
                else {
                    setError(server_resObject.message);
                }
            }

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
                console.log("response is null");
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
        saveAs(blob, "tournament_players.csv");
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

                {tournamentDetails.status === "initialised" ? (<button onClick={openModalAddPlayer}>Add Player</button>) : (null)}

                {tournamentDetails.status !== "finished" ?(
                    <div>
                        <button onClick={openModalForbPairs}>Forbidden Pairs</button>
                        <button onClick={openModalPredPairs}>Predefined Pairs</button>
                    </div>
                ):(null)}
                

                {/*Table of Players*/}
                <table style={{ border: "1px solid black" }}>
                    <thead>
                        <tr>
                            <th>№</th>
                            <th>Name</th>
                            {tournamentDetails.hide_rating ? (null):(<th>Rating</th>)}
                            <th>Club</th>
                            <th>Add. Pts</th>
                            {tournamentDetails.type === "Knockout" ? (<th>Eliminated</th>):(null)}
                        </tr>
                    </thead>
                    <tbody>
                        {listPlayersTable.map((player, index) => (
                            <tr key={player.player_id} onClick={() =>selectPlayer(player.player_id)}>
                                <td>{index + 1}</td>
                                <td>{player.name}</td>
                                {tournamentDetails.hide_rating ? (null):(<th>{player.rating}</th>)}
                                <td>{player.club}</td>
                                <td>{player.additional_points}</td>
                                {tournamentDetails.type === "Knockout" ? (
                                    player.eliminated ? (<th> Yes </th>) 
                                    : (<th> No </th>)
                                ):(null)}
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button onClick={saveCSV}>Save CSV</button>

            </div>

            <div>
                <button onClick={() => navigate(`/tournament/${tournamentId}/standings`)}>Standings</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/players`)}>Players</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/rounds`)}>Rounds</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/settings`)}>Settings</button>
            </div>

            {/*Add Player Modal*/}
            <Modal isOpen={isModalOpenAddPlayer} onClose={closeModalAddPlayer} title="Add a Participant" errorDisplay={error}>
                
                <form onSubmit={createNewPlayer} style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Name: <input type="text" value={name} onChange={(e) => setName(e.target.value)} required /> </label>
                    <label>Email: <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}/> </label>
                    <label>Club: <input type="text" value={club} onChange={(e) => setClub(e.target.value)}/> </label>
                    <label>Rating: <input type="number" value={rating} onChange={(e) => setRating(Number(e.target.value))} min={0} max={4000}/> </label>
                    <label>Additional Points: <input type="number" value={addPoints} onChange={(e) => setAddPoints(Number(e.target.value))}/> </label>
                    <button type="submit">Add</button> 
                </form>

                <label>Existing player, email: <input type="email" value={existingEmail} onChange={(e) => setExistingEmail(e.target.value)}/></label>
                <button onClick={addExistingPlayer}>Search and Add</button>
                   
            </Modal>

            {/*Edit Player Modal*/}
            <Modal isOpen={isModalOpenEditPlayer} onClose={closeModalEditPlayer} title="Edit Player" errorDisplay={error} successDisplay={successMessage}>
                
                
                <form onSubmit={editPlayerDetails} style={{ display: 'flex', flexDirection: 'column' }}>
                   
                    <label>Name: 
                        {tournamentDetails.user_id === createdBy ? (
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                        ) : (
                            <input type="text" value={name} disabled />  
                        )}
                         
                    </label>

                    <label>Email: 
                        <input type="email" value={email} readOnly/> 
                    </label>

                    <label>Club: 
                        {tournamentDetails.user_id === createdBy ? (
                            <input type="text" value={club} onChange={(e) => setClub(e.target.value)}/> 
                        ) : (
                            <input type="text" value={club} disabled/> 
                        )}
                        
                    </label>

                    <label>Rating: 
                        {tournamentDetails.user_id === createdBy ? (
                            <input type="number" value={rating} onChange={(e) => setRating(Number(e.target.value))} min={0} max={4000}/>
                        ) : (
                            <input type="number" value={rating} disabled/>
                        )}
                         
                    </label>

                    <label>Additional Points: 
                        <input type="text" value={addPoints} onChange={(e) => setAddPoints(e.target.value)} min={0}/> 
                    </label>

                    {tournamentDetails.type === "Knockout" ? (
                        <label>Eliminated: 
                            {eliminated ? (
                                <input type="text" value={"Yes"} disabled/> 
                            ):(
                                <input type="text" value={"No"} disabled/> 
                            )}
                            
                        </label>
                    ):(
                        null
                    )}
                    
                    <button type="submit">Save</button> 
                </form>
                
                {tournamentDetails.status === "initialised" ? (<button onClick={openModalRemConf}>Remove Player</button>) : (null)}
                   
            </Modal>
            

            {/* Remove Confirmation Pop-up */}
            <Modal isOpen={isModalOpenRemConf} onClose={closeModalRemConf} title="Remove This Player" errorDisplay={error}>
                
                <h3>Are you sure you want to remove this player from the tournament?</h3>
                <p>All player's data regarding this tournaments will be permanently lost.</p>
                <button onClick={removePlayer}>Confirm</button>
                <button onClick={closeModalRemConf}>Cancel</button>

            </Modal>

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
                                {/**() => removeSpecialPair(forbPair.pair_id, "forbidden") */}
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
                
                <button onClick={() => addSpecialPair("forbidden")}>Add</button>

            </Modal>

            {/* Predefined Pairs Modal */}
            <Modal isOpen={isModalOpenPredPairs} onClose={closeModalPredPairs} title="Predefined Pairs">
                
            <table>
                <thead>
                    <tr>
                        <th>Num</th>
                        <th>White</th>
                        <th>Black</th>
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
            
                <label> White:
                    <select value={player1ID} onChange={(e) => setPlayer1ID(Number(e.target.value))} required>
                        {listPlayersTable.map((player) => (
                            <option key={player.player_id} value={player.player_id}>{player.name}</option>
                        ))}
                    </select>
                </label>

                <label> Black:
                <select value={player2ID} onChange={(e) => setPlayer2ID(Number(e.target.value))} required>
                    {listPlayersTable.map((player) => (
                        <option key={player.player_id} value={player.player_id}>{player.name}</option>
                    ))}
                </select>
                </label>

                <button onClick={() => addSpecialPair("predefined")}>Add</button>
            
            </Modal>

        </div>


    );
}

export default DisplayPlayers;
