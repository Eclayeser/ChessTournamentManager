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
            //receive response from server
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
        <div className="container mt-4">
            {/* Header */}
            <h1 className="mb-3">{tournament.name}: Settings</h1>
            <h3 className="text-muted">Tournament Status: {status}</h3>

            {/* Error & Success Messages */}
            {error && <p className="alert alert-danger">{error}</p>}
            {successMessage && <p className="alert alert-success">{successMessage}</p>}

            {/* Update Tournament Form */}
            <form onSubmit={updateTournamentDetails} className="bg-light p-4 rounded shadow-sm" style={{ maxWidth: "500px" }}>
                <fieldset className="border p-3 rounded">
                    <legend className="w-auto">Tournament Details</legend>

                    {/* Tournament Name */}
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">Tournament Name:</label>
                        <input type="text" id="name" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    {/* Tournament Type (Read-Only) */}
                    <div className="mb-3">
                        <label className="form-label">Tournament Type:</label>
                        <input type="text" className="form-control" value={type} disabled />
                    </div>

                    {/* Bye Value (Disabled if Not "Initialised") */}
                    <div className="mb-3">
                        <label className="form-label">Bye Value:</label>
                        {(tournament.type === "Knockout" || tournament.type === "Round-robin" || tournament.status !== "initialised") ? (
                            <input type="number" className="form-control" value={byeVal} disabled />
                        ) : (
                            <select className="form-select" value={byeVal} onChange={(e) => setByeVal(Number(e.target.value))} required>
                                <option value={0}>0</option>
                                <option value={0.5}>0.5</option>
                                <option value={1}>1</option>
                            </select>
                        )}
                    </div>

                    {/* Tie Break (Read-Only) */}
                    <div className="mb-3">
                        <label className="form-label">Tie Break:</label>
                        <input type="text" className="form-control" value={tieBreak} disabled />
                    </div>

                    {/* Hide Rating Checkbox */}
                    <div className="form-check mb-3 ">
                        <input className="form-check-input" type="checkbox" id="hideRating" checked={hideRating} onChange={(e) => setHideRating(e.target.checked)} />
                        <label className="form-check-label" htmlFor="hideRating">Hide Rating</label>
                    </div>

                    {/* Save Button */}
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                </fieldset>
            </form>

            <div>
                {/* Delete Button */}
                <button className="btn btn-danger mt-3" onClick={openModalDelConf}>Delete Tournament</button>
            </div>

            {/* Navigation Buttons */}
            <div className="btn-group mt-4 mb-5">
                <button className="btn btn-outline-primary" onClick={() => navigate(`/tournament/${tournament.tournament_id}/standings`)}>Standings</button>
                <button className="btn btn-outline-primary" onClick={() => navigate(`/tournament/${tournament.tournament_id}/players`)}>Players</button>
                <button className="btn btn-outline-primary" onClick={() => navigate(`/tournament/${tournament.tournament_id}/rounds`)}>Rounds</button>
                <button className="btn btn-outline-secondary active" disabled>Settings</button>
            </div>
            

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isModalOpenDelConf} onClose={closeModalDelConf} title="Delete Tournament">
                <div className="text-center">
                    <h3 className="text-danger">Are you sure?</h3>
                    <p>All tournament data will be permanently deleted.</p>
                    <div className="d-flex justify-content-center gap-2">
                        <button className="btn btn-danger" onClick={deleteTournament}>Confirm</button>
                        <button className="btn btn-secondary" onClick={closeModalDelConf}>Cancel</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

//export component to be used in App.js
export default TournamentSettings;
