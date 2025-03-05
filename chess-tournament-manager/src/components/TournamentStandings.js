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
            <h2>{tournamentDetails.name}: Standings</h2>

            <div>

                {/*Table of Players*/}
                <table style={{ border: "1px solid black" }}>
                    <thead>
                        <tr>
                            <th>Position</th>
                            <th>Name</th>
                            {/*if hide rrating is enabled, do not show rating*/}
                            { tournamentDetails.hide_rating ? null : <th>Rating</th> }
                            <th>Points</th>
                            {/*mapping is used to make the number of column dynamic and correspond to the number of rounds in the list*/}
                            {rounds.map((result, index) => (
                                    <th key={index}>R{index + 1}</th>
                                ))}
                            {/*For Knockout, tie break system will be automatically disabled*/}
                            { tournamentDetails.tie_break ===  null ? null : <th>Tie Break Pts.</th> }  
                        </tr>
                    </thead>
                    <tbody>
                        {/*dynamic number of rows (section is referred to as a row)*/}
                        {standings.map((section, index) => (
                            <tr key={index}>
                                {/*Position*/}
                                <td>{index + 1}</td>
                                {/*Name and rating (if rating is enabled)*/}
                                <td>{section.name}</td>
                                { tournamentDetails.hide_rating ? null : <th>{section.rating}</th> }
                                {/*Cumulative points for each player*/}
                                <td>{section.player_points}</td>
                                {/*Dynamic number of round results rendered*/}
                                {section.rounds_result.map((result, index) => (
                                    <th key={index}>{result}</th>
                                ))}
                                {/*For Knockout, tie break system will be automatically disabled*/}
                                { tournamentDetails.tie_break ===  null ? null : <td>{section.tiebreak_points}</td> }
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button onClick={saveCSV}>Save CSV</button>

            </div>

            <div>
                <button onClick={() => navigate(`/tournament/${tournamentId}/standings`)}>Standings</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/players`)}>Players</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/rounds`)}>Rounds</button>
                <button onClick={() => navigate(`/tournament/${tournamentId}/settings`)}>Settings</button>
            </div>

        </div>


    );
}

export default DisplayStandings;
