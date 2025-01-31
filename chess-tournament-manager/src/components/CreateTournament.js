import React, {useState} from "react";
import { useNavigate } from "react-router-dom";


const CreateTournamentDisplay = () => {
    
    //variables
    const [name, setName] = useState("");
    const [type, setType] = useState("Swiss System");
    const [tieBreak, setTieBreak] = useState("Buchholz Total");
    const [maxRounds, setMaxRounds] = useState(0);
    const [maxParticipants, setMaxParticipants] = useState(0);
    const [hideRating, setHideRating] = useState(false);
    const [byeVal, setByeVal] = useState(0);

    const [error, setError] = useState("");

    //react-router-dom hook
    const navigate = useNavigate();

    //create tournament function
    const createTournament = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const sessionID = localStorage.getItem("sessionID");

            const body = {
                name: name,
                type: type,
                tie_break: tieBreak,
                max_rounds: maxRounds,
                max_participants: maxParticipants,
                hide_rating: hideRating,
                bye_value: byeVal
            }
            //fetch request to server
            const response = await fetch(`http://localhost:5000/create-tournament`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Session-Id": sessionID },
                body: JSON.stringify(body),
            });
            //response from server
            const server_resObject = await response.json();
            
            // if authorised -> set tournament details, else -> set error value and go to login page
            if (server_resObject.success === true) {
                navigate(`/tournament/${server_resObject.tournament_id}/settings`);

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

    return (
        <div>
            <h1>Create Tournament</h1>


            {error && <p className="error">{error}</p>}


            <form onSubmit={createTournament} style={{ display: "flex", flexDirection: "column", maxWidth: "400px", margin: "15px" }}>
                <label> Tournament Name:
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </label>

                <label> Maximum number of Rounds:
                    {type === "Knockout" ? (
                    <input type="text" value={"*calculated for Knockout*"} disabled /> 
                    ) : 
                    type === "Round-robin" ? (
                    <input type="text" value={"*calculated for Round-robin*"} disabled /> 
                    ) : (
                    <input type="number" value={maxRounds} onChange={(e) => setMaxRounds(Number(e.target.value))} min={1} max={50} required />
                    )}
                </label>

                <label> Maximum Players:
                    <input type="number" value={maxParticipants} onChange={(e) => setMaxParticipants(Number(e.target.value))} min={1} max={1000} required />
                </label>

                <label> Tournament Type:
                    <select value={type} onChange={(e) => setType(e.target.value)} required>
                        <option value={"Swiss System"}>Swiss System</option>
                        <option value={"Round-robin"}>Round Robin</option>
                        <option value={"Knockout"}>Knockout</option>
                    </select>
                </label>

                <label> Bye Value:
                    {type === "Knockout" ? (
                        <input type="text" value={"*default 0 for Knockout*"} disabled /> 
                    ) : 
                    type === "Round-robin" ? (
                        <input type="text" value={"*default 0 for Round-robin*"} disabled /> 
                    ) : (
                        <select value={byeVal} onChange={(e) => setByeVal(Number(e.target.value))} required>
                            <option value={0}>0</option>
                            <option value={0.5}>0.5</option>
                            <option value={1}>1</option>
                        </select>
                    )}
                </label>

                <label> Tie Break:
                    {type === "Knockout" ? 
                        <input type="text" value={"*unavailable for Knockout*"} disabled /> 
                        : 
                        <select value={tieBreak} onChange={(e) => setTieBreak(e.target.value)} required>
                            <option value={"Buchholz Total"}>Buchholz Total</option>
                            <option value={"Buchholz Cut 1"}>Buchholz Cut 1</option>
                            <option value={"Buchholz Cut Median"}>Buchholz Cut Median</option>
                            <option value={"Sonneborn-Berger"}>Sonneborn-Berger</option>
                        </select>
                    }
                </label>

                <label> Hide Rating:
                    <input type="checkbox" checked={hideRating} onChange={(e) => setHideRating(e.target.checked)} />
                </label>

                <button type="submit">Create Tournament</button>
                
            </form> 
        </div>
    );
}

export default CreateTournamentDisplay;