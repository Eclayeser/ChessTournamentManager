import React, {useState} from "react";
import { useNavigate } from "react-router-dom";

//Main Functional Component
const CreateTournamentDisplay = () => {
    
    //variables
    const [name, setName] = useState("");
    const [type, setType] = useState("Swiss System");
    const [tieBreak, setTieBreak] = useState("Buchholz Total");
    const [hideRating, setHideRating] = useState(false);
    const [byeVal, setByeVal] = useState(0);
    const [error, setError] = useState("");

    //react-router-dom hook
    const navigate = useNavigate();

    //create tournament ser-req function
    const createTournament = async (e) => {
        e.preventDefault(); //prevent default form submission
        setError(""); //empty error value
        try {
            //object to send to server
            const body = { name: name, type: type, tie_break: tieBreak,
                 hide_rating: hideRating, bye_value: byeVal };
            //send request to server
            const response = await fetch(`http://localhost:5000/create-tournament`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
                body: JSON.stringify(body),
            });
            const server_resObject = await response.json(); //response from server
            //if successful, navigate to the settings page of the created tournament
            if (server_resObject.success === true) {
                navigate(`/tournament/${server_resObject.tournament_id}/settings`);
            //else case to handle unssuccessful operation (same construct as previously used)
            } else {
                //create could not happen due to session expiration
                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                }
                //otherwise, set local error value
                else {setError(server_resObject.message);}
            }
        //catch any errors
        } catch (err) {
            console.error(err.message);
        };
    };

    return (
        <div className="container mt-4 mb-5">
            {/* Title */}
            <h1 className="text-primary text-center mb-4">Create Tournament</h1>

            {/* Error Message */}
            {error && <div className="alert alert-danger text-center">{error}</div>}

            {/* Form Container */}
            <div className="card shadow-lg p-4 mx-auto" style={{ maxWidth: "500px" }}>
                <form onSubmit={createTournament}>
                    
                    {/* Tournament Name */}
                    <div className="mb-3">
                        <label className="form-label">Tournament Name:</label>
                        <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    {/* Tournament Type */}
                    <div className="mb-3">
                        <label className="form-label">Tournament Type:</label>
                        <select className="form-select" value={type} onChange={(e) => setType(e.target.value)} required>
                            <option value="Swiss System">Swiss System</option>
                            <option value="Round-robin">Round Robin</option>
                            <option value="Knockout">Knockout</option>
                        </select>
                    </div>

                    {/* Bye Value */}
                    <div className="mb-3">
                        <label className="form-label">Bye Value:</label>
                        {type === "Knockout" || type === "Round-robin" ? (
                            <input type="text" className="form-control" value="*default 0 for this format*" disabled />
                        ) : (
                            <select className="form-select" value={byeVal} onChange={(e) => setByeVal(Number(e.target.value))} required>
                                <option value={0}>0</option>
                                <option value={0.5}>0.5</option>
                                <option value={1}>1</option>
                            </select>
                        )}
                    </div>

                    {/* Tie Break */}
                    <div className="mb-3">
                        <label className="form-label">Tie Break:</label>
                        {type === "Knockout" ? (
                            <input type="text" className="form-control" value="*unavailable for Knockout*" disabled />
                        ) : (
                            <select className="form-select" value={tieBreak} onChange={(e) => setTieBreak(e.target.value)} required>
                                <option value="Buchholz Total">Buchholz Total</option>
                                <option value="Buchholz Cut 1">Buchholz Cut 1</option>
                                <option value="Buchholz Cut Median">Buchholz Cut Median</option>
                                <option value="Sonneborn-Berger">Sonneborn-Berger</option>
                            </select>
                        )}
                    </div>

                    {/* Hide Rating Checkbox */}
                    <div className="form-check mb-3">
                        <input className="form-check-input" type="checkbox" checked={hideRating} onChange={(e) => setHideRating(e.target.checked)} />
                        <label className="form-check-label">Hide Rating</label>
                    </div>

                    {/* Submit Button */}
                    <div className="text-center">
                        <button type="submit" className="btn btn-primary px-4 py-2">Create Tournament</button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default CreateTournamentDisplay;
