import { useState, useEffect} from "react";
import { useNavigate, useParams } from "react-router-dom";

const TournamentSettings = () => {
    // Get tournament ID from URL parameters
    const { tournamentId } = useParams();


    //variables
    const [tournament, setTournament] = useState(null);
    const [localMessage, setLocalMessage] = useState("");

    const [pendingName, setPendingName] = useState("");
    const [pendingType, setPendingType] = useState("");
    const [pendingTieBreak, setPendingTieBreak] = useState("");
    const [pendingRounds, setPendingRounds] = useState(0);
    const [pendingPlayers, setPendingPlayers] = useState(0);
    const [pendingHideRating, setPendingHideRating] = useState("");
    const [pendingByeVal, setPendingByeVal] = useState("");


    
    const navigate = useNavigate();
    
    //Fetch tournament details function
    const requestTournamentDetails = async () => {
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
                setPendingName(server_resObject.details.name);
                setPendingType(server_resObject.details.type);
                setPendingTieBreak(server_resObject.details.tie_break);
                setPendingRounds(server_resObject.details.num_rounds);
                setPendingPlayers(server_resObject.details.max_players);
                setPendingHideRating(server_resObject.details.hide_rating);
                setPendingByeVal(server_resObject.details.bye_value);
                console.log(server_resObject.details);
                console.log(server_resObject.details.name);
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


    //Use useEffect to fetch tournament details when the component mounts
    useEffect(() => {
        requestTournamentDetails();
    }, [tournamentId]);

    return (
        <div>
            <h1>Tournament Settings</h1>
            <p>{localMessage}</p>
            <form style={{ display: "flex", flexDirection: "column", maxWidth: "400px", margin: "15px" }}>
                <label> Tournament Name:
                    <input type="text" value={pendingName} onChange={(e) => setPendingName(e.target.value)} required />
                </label>

                <label> Number of Rounds:
                    <input type="number" value={pendingRounds} onChange={(e) => setPendingRounds(Number(e.target.value))} required />
                </label>

                <label> Maximum Players:
                    <input type="number" value={pendingPlayers} onChange={(e) => setPendingPlayers(Number(e.target.value))} required />
                </label>

                <label> Tournament Type:
                    <input type="text" value={pendingType} disabled />
                </label>

                <label> Bye Value:
                    <input type="text" value={pendingByeVal} onChange={(e) => setPendingByeVal(e.target.value)} required />
                </label>

                <label> Tie Break:
                    <input type="text" value={pendingTieBreak} disabled />
                </label>

                <label> Hide Rating:
                    <input type="checkbox" checked={pendingHideRating} onChange={(e) => setPendingHideRating(e.target.checked)} />
                </label>

                <button type="submit">Save Changes</button>

            </form>
        </div>
    );
};

export default TournamentSettings;
