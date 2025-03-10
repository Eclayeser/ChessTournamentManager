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
            //receive response from server
            const server_resObject = await response.json();
            // if operation successful
            if (server_resObject.success === true) {
                // if there are any players in the current tournament
                if (server_resObject.players.length !== 0) {
                    // set the list of players
                    setListPlayersTable(server_resObject.players);

                    setPlayer1ID(Number(server_resObject.players[0].player_id));
                    setPlayer2ID(Number(server_resObject.players[0].player_id));
                } else {
                    // if there are no players in the current tournament
                    setListPlayersTable([]);
                }
                
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
        if (listPlayersTable.length >= 1000) {
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
            //if successful
            if (server_resObject.success === true) {
                //set success message, close the pop-up
                //re-fetch players to include new participant
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
        console.log(pair_id);
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

    //when renders
    useEffect(() => {
        //fetch tournament details and players
        requestTournamentDetails();
        fetchPlayers();
        setError("");
    }, []);

    //Display the component
    return (
        <div>
            <div class="container mt-4">
                <h1 class="mb-3">{tournamentDetails.name}: Players</h1>

                {successMessage && <p class="alert alert-success">{successMessage}</p>}

                <div class="d-flex flex-column gap-3">
                    {tournamentDetails.status === "initialised" && (
                        <div class="d-flex gap-2">
                            <button class="btn btn-primary" onClick={openModalAddPlayer}>Add Player</button>
                        </div>
                    )}

                    {tournamentDetails.status !== "finished" && (
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-secondary" onClick={openModalForbPairs}>Forbidden Pairs</button>
                            <button class="btn btn-outline-secondary" onClick={openModalPredPairs}>Predefined Pairs</button>
                        </div>
                    )}

                    <div class="table-responsive">
                        {/* table-responsive: makes the table scalable */}
                        {/* this is important since some tables increase in number of columns */}
                        <table class="table table-striped table-bordered table-hover text-center">
                            {/* 
                                table: defined table structure style
                                table-striped: zebra-striping for each row for easier distinguishing                                table-bordered: Adds borders to all table cells.
                                table-hover: hover effect (only for "player" table since the rows here are clickable).
                                text-center: centre the text.
                            */}
                            <thead class="table-dark">
                                <tr>
                                    <th>№</th>
                                    <th>Name</th>
                                    {!tournamentDetails.hide_rating && <th>Rating</th>} 
                                    <th>Club</th>
                                    <th>Add. Pts</th>
                                    {tournamentDetails.type === "Knockout" && <th>Eliminated</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {listPlayersTable.map((player, index) => (
                                    <tr key={player.player_id} onClick={() => selectPlayer(player.player_id)}>
                                        <td>{index + 1}</td>
                                        <td>{player.name}</td>
                                        {!tournamentDetails.hide_rating && <td>{player.rating}</td>}
                                        <td>{player.club}</td>
                                        <td>{player.additional_points}</td>
                                        {tournamentDetails.type === "Knockout" && (
                                            <td>{player.eliminated ? "Yes" : "No"}</td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
    
                <div>
                    <button className="btn btn-secondary me-2" onClick={saveCSV}>Save CSV</button>
                </div>
                
                <div class="btn-group mt-3 mb-5">
                    <button class="btn btn-outline-primary" onClick={() => navigate(`/tournament/${tournamentId}/standings`)}>Standings</button>
                    <button class="btn btn-outline-secondary active" disabled>Players</button>
                    <button class="btn btn-outline-primary" onClick={() => navigate(`/tournament/${tournamentId}/rounds`)}>Rounds</button>
                    <button class="btn btn-outline-primary" onClick={() => navigate(`/tournament/${tournamentId}/settings`)}>Settings</button>
                </div>

            </div>

            {/*Add Player Modal*/}
            <Modal isOpen={isModalOpenAddPlayer} onClose={closeModalAddPlayer} title="Add a Participant" errorDisplay={error}>
                <form onSubmit={createNewPlayer} className="d-flex flex-column gap-3">
                    {/* Name Field */}
                    <div className="form-group">
                        <label htmlFor="name" className="form-label">Name:</label>
                        <input
                            type="text"
                            id="name"
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Email Field */}
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email:</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Club Field */}
                    <div className="form-group">
                        <label htmlFor="club" className="form-label">Club:</label>
                        <input
                            type="text"
                            id="club"
                            className="form-control"
                            value={club}
                            onChange={(e) => setClub(e.target.value)}
                        />
                    </div>

                    {/* Rating Field */}
                    <div className="form-group">
                        <label htmlFor="rating" className="form-label">Rating:</label>
                        <input
                            type="number"
                            id="rating"
                            className="form-control"
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            min={0}
                            max={4000}
                        />
                    </div>

                    {/* Additional Points Field */}
                    <div className="form-group">
                        <label htmlFor="addPoints" className="form-label">Additional Points:</label>
                        <input
                            type="number"
                            id="addPoints"
                            className="form-control"
                            value={addPoints}
                            onChange={(e) => setAddPoints(Number(e.target.value))}
                        />
                    </div>

                    {/* Add Button */}
                    <button type="submit" className="btn btn-primary">Add</button>
                </form>

                {/* Existing Player Section */}
                <div className="mt-4">
                    <label htmlFor="existingEmail" className="form-label">Existing player, email:</label>
                    <input
                        type="email"
                        id="existingEmail"
                        className="form-control"
                        value={existingEmail}
                        onChange={(e) => setExistingEmail(e.target.value)}
                    />
                    <button onClick={addExistingPlayer} className="btn btn-primary mt-2">Search and Add</button>
                </div>
            </Modal>

            {/*Edit Player Modal*/}
            <Modal isOpen={isModalOpenEditPlayer} onClose={closeModalEditPlayer} title="Edit Player" errorDisplay={error} successDisplay={successMessage}>
                <form onSubmit={editPlayerDetails} className="d-flex flex-column gap-3">
                    {/* Name Field */}
                    <div className="form-group">
                        <label htmlFor="name" className="form-label">Name:</label>
                        {tournamentDetails.user_id === createdBy ? (
                            <input
                                type="text"
                                id="name"
                                className="form-control"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        ) : (
                            <input
                                type="text"
                                id="name"
                                className="form-control"
                                value={name}
                                disabled
                            />
                        )}
                    </div>

                    {/* Email Field */}
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email:</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            value={email}
                            readOnly
                        />
                    </div>

                    {/* Club Field */}
                    <div className="form-group">
                        <label htmlFor="club" className="form-label">Club:</label>
                        {tournamentDetails.user_id === createdBy ? (
                            <input
                                type="text"
                                id="club"
                                className="form-control"
                                value={club}
                                onChange={(e) => setClub(e.target.value)}
                            />
                        ) : (
                            <input
                                type="text"
                                id="club"
                                className="form-control"
                                value={club}
                                disabled
                            />
                        )}
                    </div>

                    {/* Rating Field */}
                    <div className="form-group">
                        <label htmlFor="rating" className="form-label">Rating:</label>
                        {tournamentDetails.user_id === createdBy ? (
                            <input
                                type="number"
                                id="rating"
                                className="form-control"
                                value={rating}
                                onChange={(e) => setRating(Number(e.target.value))}
                                min={0}
                                max={4000}
                            />
                        ) : (
                            <input
                                type="number"
                                id="rating"
                                className="form-control"
                                value={rating}
                                disabled
                            />
                        )}
                    </div>

                    {/* Additional Points Field */}
                    <div className="form-group">
                        <label htmlFor="addPoints" className="form-label">Additional Points:</label>
                        <input
                            type="text"
                            id="addPoints"
                            className="form-control"
                            value={addPoints}
                            onChange={(e) => setAddPoints(e.target.value)}
                            min={0}
                        />
                    </div>

                    {/* Eliminated Field (Only for Knockout Tournaments) */}
                    {tournamentDetails.type === "Knockout" && (
                        <div className="form-group">
                            <label htmlFor="eliminated" className="form-label">Eliminated:</label>
                            <input
                                type="text"
                                id="eliminated"
                                className="form-control"
                                value={eliminated ? "Yes" : "No"}
                                disabled
                            />
                        </div>
                    )}

                    {/* Save Button */}
                    <button type="submit" className="btn btn-primary">Save</button>
                </form>

                {/* Remove Player Button (Only for Initialised Tournaments) */}
                {tournamentDetails.status === "initialised" && (
                    <button onClick={openModalRemConf} className="btn btn-danger mt-3">Remove Player</button>
                )}
            </Modal>
            

            {/* Remove Confirmation Pop-up */}
            <Modal isOpen={isModalOpenRemConf} onClose={closeModalRemConf} title="Remove This Player" errorDisplay={error}>
                <div className="text-center">
                    <h3 className="text-danger">Are you sure?</h3>
                    <p>All player's data regarding this tournaments will be permanently lost.</p>
                    <div className="d-flex justify-content-center gap-2">
                        <button className="btn btn-danger" onClick={removePlayer}>Confirm</button>
                        <button className="btn btn-secondary" onClick={closeModalRemConf}>Cancel</button>
                    </div>
                </div>
            </Modal>

            {/* Forbidden Pairs Modal */}
            <Modal isOpen={isModalOpenForbPairs} onClose={closeModalForbPairs} title="Forbidden Pairs">
                <div className="table-responsive">
                    <table className="table table-bordered text-center">
                        {/* Simialr as previous, but does not zebra strips */}
                        <thead className="table-primary"> {/* Blue header instead */}
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
                                    <td>
                                        <button 
                                            className="btn btn-danger btn-sm"
                                            //btn-danger: red button
                                            //btn-sm: small button
                                            onClick={removeSpecialPair(forbPair.pair_id, "forbidden")}
                                        >
                                            Remove Pair
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button className="btn btn-primary mt-3" onClick={openModalAddForbPair}>Add Pair</button>
            </Modal>


            {/* Add Forbidden Pair Modal */}
            <Modal isOpen={isModalOpenAddForbPair} onClose={closeModalAddForbPair} title="Add a Pair" errorDisplay={error}>
                <form className="d-flex flex-column gap-3">
                    {/* Player 1 */}
                    <div className="form-group">
                        <label htmlFor="player1" className="form-label">Player 1:</label>
                        <select
                            id="player1"
                            className="form-select"
                            value={player1ID}
                            onChange={(e) => setPlayer1ID(Number(e.target.value))}
                            required
                        >
                            {listPlayersTable.map((player) => (
                                <option key={player.player_id} value={player.player_id}>{player.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Player 2 */}
                    <div className="form-group">
                        <label htmlFor="player2" className="form-label">Player 2:</label>
                        <select
                            id="player2"
                            className="form-select"
                            value={player2ID}
                            onChange={(e) => setPlayer2ID(Number(e.target.value))}
                            required
                        >
                            {listPlayersTable.map((player) => (
                                <option key={player.player_id} value={player.player_id}>{player.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Add Button */}
                    <button className="btn btn-primary" onClick={(e) => { e.preventDefault(); addSpecialPair("forbidden")}}>Add</button>
                </form>
            </Modal>

            {/* Predefined Pairs Modal */}
            <Modal isOpen={isModalOpenPredPairs} onClose={closeModalPredPairs} title="Predefined Pairs">
                <div className="table-responsive">
                    <table className="table table-bordered text-center">
                        <thead className="table-primary"> {/* Blue header */}
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
                                    <td>
                                        <button 
                                            className="btn btn-danger btn-sm" 
                                            onClick={removeSpecialPair(predPair.pair_id, "predefined")}
                                        >
                                            Remove Pair
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button className="btn btn-primary mt-3" onClick={openModalAddPredPair}>Add Pair</button>
            </Modal>
            
            
            {/* Add Predefined Pair Modal */}
            <Modal isOpen={isModalOpenAddPredPair} onClose={closeModalAddPredPair} title="Add a Pair" errorDisplay={error}>
                <form className="d-flex flex-column gap-3">
                    {/* White Player */}
                    <div className="form-group">
                        <label htmlFor="whitePlayer" className="form-label">White:</label>
                        <select
                            id="whitePlayer"
                            className="form-select"
                            value={player1ID}
                            onChange={(e) => setPlayer1ID(Number(e.target.value))}
                            required
                        >
                            {listPlayersTable.map((player) => (
                                <option key={player.player_id} value={player.player_id}>{player.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Black Player */}
                    <div className="form-group">
                        <label htmlFor="blackPlayer" className="form-label">Black:</label>
                        <select
                            id="blackPlayer"
                            className="form-select"
                            value={player2ID}
                            onChange={(e) => setPlayer2ID(Number(e.target.value))}
                            required
                        >
                            {listPlayersTable.map((player) => (
                                <option key={player.player_id} value={player.player_id}>{player.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Add Button */}
                    <button className="btn btn-primary" onClick={(e) => { e.preventDefault(); addSpecialPair("predefined")}}>Add</button>
                </form>
            </Modal>

        </div>


    );
}

export default DisplayPlayers;
