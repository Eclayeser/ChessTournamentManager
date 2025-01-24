import { useState, useEffect} from "react";
import { useNavigate, useParams } from "react-router-dom";

import Modal from "./ModalTemplate";

const TournamentSettings = () => {
    // Get tournament ID from URL parameters
    const { tournamentId } = useParams();


    //variables
    const [tournament, setTournament] = useState(null);

    const [pendingName, setPendingName] = useState("");
    const [pendingType, setType] = useState("");
    const [pendingTieBreak, setTieBreak] = useState("");
    const [pendingRounds, setPendingRounds] = useState(0);
    const [pendingPlayers, setPendingPlayers] = useState(0);
    const [pendingHideRating, setPendingHideRating] = useState("");
    const [pendingByeVal, setPendingByeVal] = useState("");

    const [error, setError] = useState("");

    
    const navigate = useNavigate();

    //State variables and functions for Delete Confirmation Pop-Up
    const [isModalOpenDelConf, setIsModalOpenDelConf] = useState(false);

    const openModalDelConf = () => {
        setIsModalOpenDelConf(true);

        setError("");
    }

    const closeModalDelConf = () => {
        setIsModalOpenDelConf(false);

        setError("");
    }
    
    //Fetch tournament details function
    const requestTournamentDetails = async () => {
        setError("");

        try {
            const sessionID = localStorage.getItem("sessionID");

            //fetch request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/details`, {
                method: "GET",
                headers: { "Content-Type": "application/json", "Session-Id": sessionID },
            });
            //response from server
            const server_resObject = await response.json();
            

            // if authorised -> set tournament details, else -> set error value and go to login page
            if (server_resObject.success === true) {

                setTournament(server_resObject.details);

                setType(server_resObject.details.type);
                setTieBreak(server_resObject.details.tie_break);

                setPendingName(server_resObject.details.name);
                setPendingRounds(server_resObject.details.num_rounds);
                setPendingPlayers(server_resObject.details.max_players);
                setPendingHideRating(server_resObject.details.hide_rating);
                setPendingByeVal(server_resObject.details.bye_value);
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

    const updateTournamentDetails = async e => {
        e.preventDefault();
        setError("");

        try {
            const sessionID = localStorage.getItem("sessionID");
            const body = {
                        name: pendingName,
                        numRounds: pendingRounds,
                        maxPlayers: pendingPlayers,
                        byeValue: pendingByeVal,
                        hideRating: pendingHideRating
            }; 

            //fetch request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/updateDetails`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Session-Id": sessionID },
                body: JSON.stringify(body),
            });
            //response from server
            const server_resObject = await response.json();
            console.log(server_resObject);

            // if authorised -> set new tournament details
            if (server_resObject.success === true) {
                console.log(server_resObject.message);
            } 
            else {
                // update could not happen due to session expiration
                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                }
                // delete failed due to server error
                else {
                    setError(server_resObject.message);
                }
            }

        //catch any errors
        } catch (err) {
            console.error(err.message);
        }
    }

    const deleteTournament = async () => {
        setError("");

        try {
            const sessionID = localStorage.getItem("sessionID");

            //fetch request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/delete`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", "Session-Id": sessionID },
            });
            //response from server
            const server_resObject = await response.json();
            console.log(server_resObject);

            // if authorised -> go to dashboard
            if (server_resObject.success === true) {
                navigate("/dashboard");
            } 
            else {
                // delete could not happen due to session expiration
                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                }
                // delete failed due to server error
                else {
                    setError(server_resObject.message);
                }
            }

        //catch any errors
        } catch (err) {
            console.error(err.message);
        }
    }


    //Use useEffect to fetch tournament details when the component mounts
    useEffect(() => {
        requestTournamentDetails();
    }, [tournamentId]);

    return (
        <div>
            <h1>Tournament Settings</h1>
            {error && <p className="error">{error}</p>}
            <form onSubmit={updateTournamentDetails} style={{ display: "flex", flexDirection: "column", maxWidth: "400px", margin: "15px" }}>
                <label> Tournament Name:
                    <input type="text" value={pendingName} onChange={(e) => setPendingName(e.target.value)} required />
                </label>

                <label> Number of Rounds:
                    <input type="number" value={pendingRounds} onChange={(e) => setPendingRounds(Number(e.target.value))} min={1} max={50} required />
                </label>

                <label> Maximum Players:
                    <input type="number" value={pendingPlayers} onChange={(e) => setPendingPlayers(Number(e.target.value))} min={1} max={1000} required />
                </label>

                <label> Tournament Type:
                    <input type="text" value={pendingType} disabled />
                </label>

                <label> Bye Value:
                    <select value={pendingByeVal} onChange={(e) => setPendingByeVal(Number(e.target.value))} required>
                        <option value={0}>0</option>
                        <option value={0.5}>0.5</option>
                        <option value={1}>1</option>
                    </select>
                </label>

                <label> Tie Break:
                    <input type="text" value={pendingTieBreak} disabled />
                </label>

                <label> Hide Rating:
                    <input type="checkbox" checked={pendingHideRating} onChange={(e) => setPendingHideRating(e.target.checked)} />
                </label>

                <button type="submit">Save Changes</button>
                
            </form> 
            <button onClick={openModalDelConf}>Delete</button>

            <div>
                <button>Standings</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/players`)}>Players</button>
                <button>Rounds</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/settings`)}>Settings</button>
            </div>

            <Modal isOpen={isModalOpenDelConf} onClose={closeModalDelConf} title="Delete Confirmation" errorDisplay={error}>
                <h3>Are you sure you want to delete this tournament?</h3>
                <p>All the tournament data will be permanently lost.</p>
                <button onClick={deleteTournament}>Confirm</button>
                <button onClick={closeModalDelConf}>Cancel</button>  
            </Modal>

        </div>
    );
};

export default TournamentSettings;
