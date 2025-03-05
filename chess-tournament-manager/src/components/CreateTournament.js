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
        <div>
            <h1>Create Tournament</h1>
            {error && <p className="error">{error}</p>}

            <form onSubmit={createTournament} style={{ display: "flex", flexDirection: "column", maxWidth: "400px", margin: "15px" }}>

                {/* Tournament Name: fully customizable */}
                <label> Tournament Name:
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </label>
                {/* Tournament Type: drop-down menu with 3 options */}
                <label> Tournament Type:
                    <select value={type} onChange={(e) => setType(e.target.value)} required>
                        <option value={"Swiss System"}>Swiss System</option>
                        <option value={"Round-robin"}>Round Robin</option>
                        <option value={"Knockout"}>Knockout</option>
                    </select>
                </label>
                {/* Bye Value: */}
                <label> Bye Value:
                    {/*If Knockout OR Round-Robin selected, disable input*/} 
                    {type === "Knockout" ? (
                        //display message 
                        //that informs user that input is disabled for this tournament type
                        <input type="text" value={"*default 0 for Knockout*"} disabled /> 
                    ) : 
                    type === "Round-robin" ? (
                        //display message 
                        <input type="text" value={"*default 0 for Round-robin*"} disabled /> 
                    //Otherwise, provide drop-down menu with 3 possible options
                    ) : (
                        <select value={byeVal} onChange={(e) => setByeVal(Number(e.target.value))} required>
                            <option value={0}>0</option>
                            <option value={0.5}>0.5</option>
                            <option value={1}>1</option>
                        </select>
                    )}
                </label>
                {/* Tie Break: */}
                <label> Tie Break:
                    {/*If Knockout selected, disable input*/}
                    {type === "Knockout" ? 
                        <input type="text" value={"*unavailable for Knockout*"} disabled /> 
                        //Otherwise, provide drop-down menu with 4 options
                        : 
                        <select value={tieBreak} onChange={(e) => setTieBreak(e.target.value)} required>
                            <option value={"Buchholz Total"}>Buchholz Total</option>
                            <option value={"Buchholz Cut 1"}>Buchholz Cut 1</option>
                            <option value={"Buchholz Cut Median"}>Buchholz Cut Median</option>
                            <option value={"Sonneborn-Berger"}>Sonneborn-Berger</option>
                        </select>
                    }
                </label>
                {/* Hide Rating: tickbox*/}
                <label> Hide Rating:
                    <input type="checkbox" checked={hideRating} onChange={(e) => setHideRating(e.target.checked)} />
                </label>

                <button type="submit">Create Tournament</button>
                
            </form> 
        </div>
    );
}

export default CreateTournamentDisplay;