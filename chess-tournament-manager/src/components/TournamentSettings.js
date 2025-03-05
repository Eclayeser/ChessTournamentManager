// Import necessary libraries and hooks
import { useState, useEffect} from "react";
import { useNavigate, useParams } from "react-router-dom";

//import Modal component
import Modal from "./ModalTemplate";

//Functional component
const TournamentSettings = () => {

    // Get tournament ID from URL parameters
    const { tournamentId } = useParams();

    //variables
    const [tournament, setTournament] = useState({});

    const [status, setStatus] = useState("");

    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [tieBreak, setTieBreak] = useState("");
    const [hideRating, setHideRating] = useState("");
    const [byeVal, setByeVal] = useState("");

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    //react-router-dom hooks
    const navigate = useNavigate();

    //Variables and functions for Delete Confirmation Pop-Up
    const [isModalOpenDelConf, setIsModalOpenDelConf] = useState(false);

    const openModalDelConf = () => {
        setIsModalOpenDelConf(true);

        setError("");
        setSuccessMessage("");
    }

    const closeModalDelConf = () => {
        setIsModalOpenDelConf(false);

        setError("");
        setSuccessMessage("");
    }
    
    //Fetch tournament details function
    const requestTournamentDetails = async () => {
        try {

            //send request to server with dynamic URL
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/fetch-details`, {
                method: "GET",
                headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
            });
            //response from server
            const server_resObject = await response.json();

            // if authorised -> set tournament details, else -> set error value and go to login page
            if (server_resObject.success === true) {

                setTournament(server_resObject.details);

                setType(server_resObject.details.type);
                setName(server_resObject.details.name);
                setHideRating(server_resObject.details.hide_rating);
                setByeVal(server_resObject.details.bye_value);
                setStatus(server_resObject.details.status)

                if (!server_resObject.details.tie_break) {
                    setTieBreak("None")
                } else {
                    setTieBreak(server_resObject.details.tie_break);
                }
                
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

    const updateTournamentDetails = async e => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        try {
            //object to be sent to server
            const body = {
                        name: name,
                        type: type,
                        bye_value: byeVal,
                        hide_rating: hideRating
            }; 

            console.log(body);

            //send request to server with dynamic URL
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/update-details`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
                body: JSON.stringify(body),
            });
            //response from server
            const server_resObject = await response.json();

            // if operation successful  -> set new tournament details
            if (server_resObject.success === true) {
                setSuccessMessage(server_resObject.message);
                requestTournamentDetails();

            // if session expired -> go to login page, else -> set error value    
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

    const deleteTournament = async () => {
        setError("");
        setSuccessMessage("");

        try {
            //send request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/delete`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
            });
            //response from server
            const server_resObject = await response.json();


            // if operation successful
            if (server_resObject.success === true) {
                //close modal and navigate to dashboard
                closeModalDelConf();
                navigate("/dashboard");

            // if session expired -> go to login page, else -> set error value    
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


    //Use useEffect to fetch tournament details when the component mounts
    useEffect(() => {
        setError("");
        setSuccessMessage("");
        requestTournamentDetails();
    }, [tournamentId]);

    //Display component
    return (
        <div>
            <h1>{tournament.name}: Settings</h1>
            <h3>Tournament Status: {status}</h3>

            {error && <p style={{color:"red"}}>{error}</p>}
            {successMessage && <p style={{color:"green"}}>{successMessage}</p>}

            {/*Form to update tournament details*/}
            <form onSubmit={updateTournamentDetails} style={{ display: "flex", flexDirection: "column", maxWidth: "400px", margin: "15px" }}>

                <label> Tournament Name:
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </label>

                {/* Tournament Type */}
                <label> Tournament Type:
                    {/*designed to only display the type of the tournament*/}
                    <input type="text" value={type} disabled />
                </label>

                <label> Bye Value:
                    {/*Include check to disable input if tournament is not in initial state*/}
                    {(tournament.type === "Knockout" || tournament.type === "Round-robin" || tournament.status !== "initialised") ? (
                        <input type="number" value={byeVal} disabled />
                    ) : (
                        <select value={byeVal} onChange={(e) => setByeVal(Number(e.target.value))} required>
                            <option value={0}>0</option>
                            <option value={0.5}>0.5</option>
                            <option value={1}>1</option>
                        </select>
                    )}
                </label>

                <label> Tie Break:
                    <input type="text" value={tieBreak} disabled />
                </label>

                <label> Hide Rating:
                    <input type="checkbox" checked={hideRating} onChange={(e) => setHideRating(e.target.checked)} />
                </label>

                <button type="submit">Save Changes</button>
                
            </form> 
            <button onClick={openModalDelConf}>Delete</button>

            {/*Navigation buttons*/}
            <div>
                <button onClick={() => navigate(`/tournament/${tournamentId}/standings`)}>Standings</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/players`)}>Players</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/rounds`)}>Rounds</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/settings`)}>Settings</button>
            </div>

            {/*Delete Confirmation Modal*/}
            <Modal isOpen={isModalOpenDelConf} onClose={closeModalDelConf} title="Delete Confirmation" errorDisplay={error}>
                {/*Confirmation message*/}
                <h3>Are you sure you want to delete this tournament?</h3>
                <p>All the tournament data will be permanently lost.</p>
                {/*Buttons to confirm or cancel operation*/}
                <button onClick={deleteTournament}>Confirm</button>
                <button onClick={closeModalDelConf}>Cancel</button>  
            </Modal>

        </div>
    );
};

//export component to be used in App.js
export default TournamentSettings;
