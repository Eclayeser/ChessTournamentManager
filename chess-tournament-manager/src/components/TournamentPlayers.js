import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";

import Modal from "./ModalTemplate";

const DisplayPlayers = () => {

    const [players, setPlayers] = useState([]);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [tournamentName, setTournamentName] = useState("");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [club, setClub] = useState("");
    const [rating, setRating] = useState(0);
    const [addPoints, setAddPoints] = useState(0);

    const [existingEmail, setExistingEmail] = useState("");

    const [editPlayerId, setEditPlayerId] = useState({});


    
    const { tournamentId } = useParams();
    const navigate = useNavigate();

    //Add Player Modal
    const [isModalOpenAddPlayer, setIsModalOpenAddPlayer] = useState(false);

    const openModalAddPlayer = () => {
        setIsModalOpenAddPlayer(true);

        setError("");
    }

    const closeModalAddPlayer = () => {
        setIsModalOpenAddPlayer(false);

        setError("");
    }

    //Edit Player Modal
    const [isModalOpenEditPlayer, setIsModalOpenEditPlayer] = useState(false);

    const openModalEditPlayer = () => {
        setIsModalOpenEditPlayer(true);

        setError("");
    }

    const closeModalEditPlayer = () => {
        setIsModalOpenEditPlayer(false);

        setError("");
    }

    //Remove Confirmation Modal
    const [isModalOpenRemConf, setIsModalOpenRemConf] = useState(false);

    const openModalRemConf = () => {
        setIsModalOpenRemConf(true);
        setIsModalOpenEditPlayer(false);

        setError("");
    }

    const closeModalRemConf = () => {
        setIsModalOpenRemConf(false);
        setIsModalOpenEditPlayer(true);

        setError("");
    }

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

    const createNewPlayer = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        try {
            const sessionID = localStorage.getItem("sessionID");

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
            
            // if authorised -> set tournament details, else -> set error value and go to login page
            if (server_resObject.success === true) {
                closeModalAddPlayer();
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

    const openAndEditPlayer = async (playerId) => {
        //fetch player details
        try {

            const body = { player_id: playerId };
            const sessionID = localStorage.getItem("sessionID");

            const response = await fetch(`http://localhost:5000/fetch-player-details`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Session-Id": sessionID },
                body: JSON.stringify(body),
            });
            
            //response from server
            const server_resObject = await response.json();

            if (server_resObject.success === true) {
                console.log(server_resObject.player);
                setName(server_resObject.player.name);
                setEmail(server_resObject.player.email);
                setClub(server_resObject.player.club);
                setRating(server_resObject.player.rating);
                setAddPoints(server_resObject.player.add_points);

                setEditPlayerId(playerId);
                openModalEditPlayer();
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
            


    useEffect(() => {
        fetchPlayers();
        setError("");
        setSuccessMessage("");
    }, [tournamentId]);

    return (
        <div>
            <h2>{tournamentName}: Players</h2>
            {successMessage && <p style={{color:'green'}}>{successMessage}</p>}
            <div>
                <button onClick={openModalAddPlayer}>Add Player</button>
                <button>Forbidden Pairs</button>
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
                <button>Save CSV</button>
            </div>

            <div>
                <button>Standings</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/players`)}>Players</button>
                <button>Rounds</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/settings`)}>Settings</button>
            </div>


            <Modal isOpen={isModalOpenAddPlayer} onClose={closeModalAddPlayer} title="Add a Participant" errorDisplay={error}>
                <form onSubmit={createNewPlayer} style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Name: <input type="text" value={name} onChange={(e) => setName(e.target.value)} required /> </label>
                    <label>Email: <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}/> </label>
                    <label>Club: <input type="text" value={club} onChange={(e) => setClub(e.target.value)}/> </label>
                    <label>Rating: <input type="number" value={rating} onChange={(e) => setRating(Number(e.target.value))} min={0} max={4000}/> </label>
                    <label>Additional Points: <input type="number" value={addPoints} onChange={(e) => setAddPoints(e.target.value)} min={0}/> </label>
                    <button type="submit">Add</button> 
                </form>
                <label>Existing player, email: <input type="email" value={existingEmail} onChange={(e) => setExistingEmail(e.target.value)}/></label>
                <button onClick={addExistingPlayer}>Search and Add</button>
                   
            </Modal>

            <Modal isOpen={isModalOpenEditPlayer} onClose={closeModalEditPlayer} title="Edit Player" errorDisplay={error} successDisplay={successMessage}>
                <form onSubmit={editPlayerDetails} style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Name: <input type="text" value={name} onChange={(e) => setName(e.target.value)} required /> </label>
                    <label>Email: <input type="email" value={email} readOnly/> </label>
                    <label>Club: <input type="text" value={club} onChange={(e) => setClub(e.target.value)}/> </label>
                    <label>Rating: <input type="number" value={rating} onChange={(e) => setRating(Number(e.target.value))} min={0} max={4000}/> </label>
                    <label>Additional Points: <input type="number" value={addPoints} onChange={(e) => setAddPoints(e.target.value)} min={0}/> </label>
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


        </div>


    );
}

export default DisplayPlayers;