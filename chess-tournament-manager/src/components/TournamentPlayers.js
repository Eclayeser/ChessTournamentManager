//Import neccessary libraries and hooks
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { saveAs } from 'file-saver'; 

//Import Modal component
import Modal from "./ModalTemplate";


//Functional component
const DisplayPlayers = () => {


    //variables
    const [players, setPlayers] = useState([]);
 
    const [tournamentName, setTournamentName] = useState("");

    const [forbiddenPairs, setForbiddenPairs] = useState([]);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [club, setClub] = useState("");
    const [rating, setRating] = useState(0);
    const [addPoints, setAddPoints] = useState(0);

    const [existingEmail, setExistingEmail] = useState("");

    const [editPlayerId, setEditPlayerId] = useState(null);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [player1, setPlayer1] = useState("");
    const [player2, setPlayer2] = useState("");

    
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
        fetchForbiddenPairs();
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
    };

    const closeModalAddForbPair = () => {
        setIsModalOpenAddForbPair(false);
    };

    const emptyPlayerDetails = () => {
        setName("");
        setEmail("");
        setClub("");
        setRating(0);
        setAddPoints(0);
        setExistingEmail("");
    };

    const fillPlayerDetails = (player) => {
        setName(player.name);
        setEmail(player.email);
        setClub(player.club);
        setRating(player.rating);
        setAddPoints(player.add_points);
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

                setTournamentName(server_resObject.tournament.name);
                console.log(server_resObject.players);

                if (server_resObject.players.length !== 0) {
                    setPlayers(server_resObject.players);

                    setPlayer1(Number(server_resObject.players[0].player_id));
                    setPlayer2(Number(server_resObject.players[0].player_id));
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
            //get sessionID from localStorage
            const sessionID = localStorage.getItem("sessionID");

            //object to be sent to server
            const body = {
                name: name,
                rating: rating,
                club: club,
                email: email,
                add_points: addPoints
            }

            //fetch request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/create-player`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Session-Id": sessionID },
                body: JSON.stringify(body),
            });
            //response from server
            const server_resObject = await response.json();
            
            // if operation successful -> set tournament details
            if (server_resObject.success === true) {
                closeModalAddPlayer();
                setSuccessMessage(server_resObject.message);
                fetchPlayers();

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

    const openAndEditPlayer = async (playerId) => {
        //fetch player details
        try {

            const sessionID = localStorage.getItem("sessionID");
            //object to be sent to server
            const body = { player_id: playerId };

            //fetch request to server
            const response = await fetch(`http://localhost:5000/fetch-player-details`, {
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
                add_points: addPoints
            }
            //fetch request to server
            const response = await fetch(`http://localhost:5000/edit-player-details`, {
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
            console.log(server_resObject);
            
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


    const addExistingPlayer = async () => {
        setError("");
        setSuccessMessage("");

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

    const fetchForbiddenPairs = async () => {
        try {
            const sessionID = localStorage.getItem("sessionID");

            //send request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/forbidden-pairs`, {
                method: "GET",
                headers: { "Content-Type": "application/json", "Session-Id": sessionID },
            });

            //response from server
            const server_resObject = await response.json();


            // if operation successful -> set tournament details
            if (server_resObject.success === true) {
                setForbiddenPairs(server_resObject.forbidden_pairs);
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

    const removeForbiddenPair = (pair_id) => async () => {
        
        try {
            const sessionID = localStorage.getItem("sessionID");
            const body = { pair_id: pair_id };

            //send request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/remove-forbidden-pair`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Session-Id": sessionID },
                body: JSON.stringify(body),
            });

            //response from server
            const server_resObject = await response.json();


            // if operation successful -> set tournament details
            if (server_resObject.success === true) {
                fetchForbiddenPairs();
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
            
    const addForbiddenPair = async () => {
        setError("");

         try{
            const sessionID = localStorage.getItem("sessionID");

            const body = {
                player1_id: player1,
                player2_id: player2
            }

            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/add-forbidden-pair`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Session-Id": sessionID },
                body: JSON.stringify(body),
            });

            const server_resObject = await response.json();

            if (server_resObject.success === true) {
                closeModalAddForbPair();
                fetchForbiddenPairs();
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
        fetchPlayers();
        setError("");
        setSuccessMessage("");
    }, [tournamentId]);

    //Display the component
    return (
        <div>
            <h2>{tournamentName}: Players</h2>

            {successMessage && <p style={{color:'green'}}>{successMessage}</p>}

            <div>

                <button onClick={openModalAddPlayer}>Add Player</button>
                <button onClick={openModalForbPairs}>Forbidden Pairs</button>

                {/*Table of Players*/}
                <table style={{ border: "1px solid black" }}>
                    <thead>
                        <tr>
                            <th>№</th>
                            <th>Name</th>
                            <th>Rating</th>
                            <th>Add. Points</th>
                            <th>Club</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((player, index) => (
                            <tr key={player.player_id} onClick={() => openAndEditPlayer(player.player_id)}>
                                <td>{index + 1}</td>
                                <td>{player.name}</td>
                                <td>{player.rating}</td>
                                <td>{player.add_points}</td>
                                <td>{player.club}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button onClick={saveCSV}>Save CSV</button>

            </div>

            <div>
                <button onClick={() => navigate(`/tournament/${tournamentId}/standings`)}>Standings</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/players`)}>Players</button>
                <button>Rounds</button>
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
                    <label>Name: <input type="text" value={name} onChange={(e) => setName(e.target.value)} required /> </label>
                    <label>Email: <input type="email" value={email} readOnly/> </label>
                    <label>Club: <input type="text" value={club} onChange={(e) => setClub(e.target.value)}/> </label>
                    <label>Rating: <input type="number" value={rating} onChange={(e) => setRating(Number(e.target.value))} min={0} max={4000}/> </label>
                    <label>Additional Points: <input type="text" value={addPoints} onChange={(e) => setAddPoints(e.target.value)} min={0}/> </label>
                    <button type="submit">Save</button> 
                </form>
                
                <button onClick={openModalRemConf}>Remove Player</button>
                   
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
                            <tr key={`${forbPair.player1_id}-${forbPair.player2_id}`}>
                                <td>{index + 1}</td>
                                <td>{forbPair.player1_name}</td>
                                <td>{forbPair.player2_name}</td>
                                <td><button onClick={removeForbiddenPair(index)}>Remove Pair</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button onClick={openModalAddForbPair}>Add Pair</button>
            </Modal>

            {/* Add Forbidden Pair Modal */}
            <Modal isOpen={isModalOpenAddForbPair} onClose={closeModalAddForbPair} title="Add a Pair" errorDisplay={error}>
                
                 <label> Player 1:
                    <select value={player1} onChange={(e) => setPlayer1(Number(e.target.value))} required>
                        {players.map((player) => (
                            <option key={player.player_id} value={player.player_id}>{player.name}</option>
                        ))}
                    </select>
                </label>

                <label> Player 2:
                    <select value={player2} onChange={(e) => setPlayer2(Number(e.target.value))} required>
                        {players.map((player) => (
                            <option key={player.player_id} value={player.player_id}>{player.name}</option>
                        ))}
                    </select>
                </label>
                
                <button onClick={addForbiddenPair}>Add</button>

            </Modal>

        </div>


    );
}

export default DisplayPlayers;