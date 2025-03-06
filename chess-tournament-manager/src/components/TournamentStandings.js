//Import neccessary libraries and hooks
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { saveAs } from "file-saver";

const DisplayStandings = () => {

    const navigate = useNavigate();

    const { tournamentId } = useParams();

    const [standings, setStandings] = useState([]);
    const [rounds, setRounds] = useState([]); 
    const [tournamentDetails, setTournamentDetails] = useState({});

     // Fetch the tournament details function (using tournamentID)
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
                console.log(server_resObject.details);
                
            } else {

                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                } else {
                    console.log(server_resObject.message);
                };
            };

        //catch any errors
        } catch (err) {
            console.error(err.message);
        };
    };   


    const fetchStandings = async () => {
        try{
            const response = await fetch(`http://localhost:5000/tournament/${tournamentId}/standings`, {
                method: "GET",
                headers: { "Content-Type": "application/json", "Session-Id": localStorage.getItem("sessionID") },
            });
            const server_resObject = await response.json();

            if (server_resObject.success === true){
                setStandings(server_resObject.standings);
                setRounds(server_resObject.standings[0].rounds_result);

            } else {
                if (server_resObject.found === false) {
                    localStorage.removeItem("sessionID");
                    localStorage.setItem("globalMessage", server_resObject.message);
                    navigate("/login");
                } else {
                
                    console.log(server_resObject.message);
                };
            }

        } catch (err) {
            console.error(err.message);
        };
    };

    //Save CSV
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
            saveAs(blob, `${tournamentDetails.name}_standings.csv`);
        };

    useEffect(() => {
        //fetch data
        fetchStandings();
        requestTournamentDetails();
    }, []);

    //Display the component
    return (
        <div>
            <div class="container mt-4">
                <h2 class="mb-3">{tournamentDetails.name}: Standings</h2>

                <div class="d-flex flex-column gap-3">
                    {/* Table of Players */}
                    <div class="table-responsive">
                        <table class="table table-striped table-bordered text-center">
                            <thead class="table-dark">
                                <tr>
                                    <th>Position</th>
                                    <th>Name</th>
                                    {/* if hide_rating is enabled, do not show rating */}
                                    {!tournamentDetails.hide_rating && <th>Rating</th>}
                                    <th>Points</th>
                                    {/* mapping is used to make the number of columns dynamic and correspond to the number of rounds in the list */}
                                    {rounds.map((result, index) => (
                                        <th key={index}>R{index + 1}</th>
                                    ))}
                                    {/* For Knockout, tie break system will be automatically disabled */}
                                    {tournamentDetails.tie_break !== null && <th>Tie Break Pts.</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {/* dynamic number of rows (section is referred to as a row) */}
                                {standings.map((section, index) => (
                                    <tr key={index}>
                                        {/* Position */}
                                        <td>{index + 1}</td>
                                        {/* Name and rating (if rating is enabled) */}
                                        <td>{section.name}</td>
                                        {!tournamentDetails.hide_rating && <td>{section.rating}</td>}
                                        {/* Cumulative points for each player */}
                                        <td>{section.player_points}</td>
                                        {/* Dynamic number of round results rendered */}
                                        {section.rounds_result.map((result, index) => (
                                            <td key={index}>{result}</td>
                                        ))}
                                        {/* For Knockout, tie break system will be automatically disabled */}
                                        {tournamentDetails.tie_break !== null && <td>{section.tiebreak_points}</td>}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Save CSV Button */}
                <div>
                    <button class="btn btn-secondary me-2" onClick={saveCSV}>Save CSV</button>
                </div>
                

                {/* Navigation Buttons */}
                <div class="btn-group mt-3 mb-5">
                    <button class="btn btn-outline-secondary active" disabled>Standings</button>
                    <button className="btn btn-outline-primary" onClick={() => navigate(`/tournament/${tournamentId}/players`)}>Players</button>
                    <button class="btn btn-outline-primary" onClick={() => navigate(`/tournament/${tournamentId}/rounds`)}>Rounds</button>
                    <button class="btn btn-outline-primary" onClick={() => navigate(`/tournament/${tournamentId}/settings`)}>Settings</button>
                </div>
            </div>
        </div>


    );
}

export default DisplayStandings;
