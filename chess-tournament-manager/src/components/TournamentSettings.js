import { useContext, useState, useEffect} from "react";
import { useNavigate, useParams } from "react-router-dom";

//Import AppContext
import { AppContext } from "./AppContext";

const TournamentSettings = () => {
    //global vars 
    const {username, password, setError} = useContext(AppContext);

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
    const [pendingByeVal, setPendingByeVal] = useState(false);


    
    const navigate = useNavigate();
    
    //Fetch tournament details function
    const requestTournamentDetails = async () => {
        try {
            //object to be sent to server
            const body = { givenUsername: username, givenPassword: password };

            //fetch request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            //response from server
            const server_res_obj = await response.json();

            // if authorised -> set tournament details, else -> set error value and go to login page
            if (server_res_obj.found === true) {
                setTournament(server_res_obj.tournament_details);
            } else {
                setError(server_res_obj.message);
                navigate("/login");
            }

        //catch any errors
        } catch (err) {
            console.error(err.message);
        }
    };


   



    const resetPendingValues = () => {
        setPendingName(tournament.name);
        setPendingType(tournament.type);
        setPendingPlayers(tournament.max_players);
        setPendingRounds(tournament.num_rounds);
        setPendingHideRating(tournament.hide_rating);
        setPendingByeVal(tournament.bye_value);
        setPendingTieBreak(tournament.tie_break);
    }


    //Use useEffect to fetch tournament details when the component mounts
    useEffect(() => {
        if (tournament) {
            resetPendingValues();
        }
    }, [tournament]);

    //Use useEffect to fetch tournament details when the component mounts
    useEffect(() => {
        requestTournamentDetails();
    }, [tournamentId]);

    return (
        <div>
            <p>{localMessage}</p>
            <form>
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

/*

<button type="button" onClick={() => navigate(-1)}>Cancel</button>

 //Update tournament details function, WILL IT CALL REQUESTTOURNAMENTS ITSELF AGAIN?
    const updateDetails = async () => {
        try {
            //object to be sent to server
            const body = { givenUsername: username, givenPassword: password };

            //fetch request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/settings`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            //response from server
            const server_res_obj = await response.json();

            // if authorised -> set tournament details, else -> set error value and go to login page
            if (server_res_obj.found === true) {
                if (server_res_obj.success === true){
                    setTournament(server_res_obj.tournament_details); //Doubting
                    setLocalMessage(server_res_obj.message);
                //User authorised, but validation failed, so updating failed
                } else {
                    setLocalMessage(server_res_obj.message)
                }
                
            // Unauthorised attempt  
            } else {
                setError(server_res_obj.message);
                navigate("/login");
            }

        //catch any errors
        } catch (err) {
            console.error(err.message);
        }
    }


    //Delete tournament function
    const deleteTournament = async () => {
        //alert message to consirm action

        //continue to deletion if confirmed
        try {
            //object to be sent to server
            const body = { givenUsername: username, givenPassword: password };

            //fetch request to server
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/delete`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            //response from server
            const server_res_obj = await response.json();

            // if authorised -> delete tournament and go to dashboard, else -> set error value and go to login page
            if (server_res_obj.found === true) {
                //User authorised and deletion successful
                if (server_res_obj.success === true){
                    navigate("/dashboard")
                //User authorised, but deletion failed
                } else {
                    setLocalMessage(server_res_obj.message)
                }
                
            // Unauthorised attempt  
            } else {
                setError(server_res_obj.message);
                navigate("/login");
            }

        //catch any errors
        } catch (err) {
            console.error(err.message);
        }
    }
        */