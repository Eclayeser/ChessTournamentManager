// Import the Express and CROS modules
const express = require("express");
const cors = require("cors");

// Import database instance
const pool = require("./database");

// Create instance of Express
const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Message to confirm server start
app.listen(5000, () => {
    console.log("server has started on port 5000")
});

// test connection to database
function testConnection() {
    // SELECT query to test connection
    pool.query("SELECT 1", (error, res) => {
        if (error) {
            // output error message if failed
            console.log(error);
        } else {
            // output success message if successful
            console.log("Database connected");
        }
    });
}
// call the testConnection function
testConnection();

//-----------------------------------------------------------------------

//sessions
const sessions = {};

//time to live for sessions (in milliseconds)
const SESSION_TTL = 30 * 60 * 1000; // 30 minutes
//function to clean up expired sessions
const cleanUpSessions = () => {
    // get the current time
    const now = Date.now();
    // iterate through the sessions object
    for (const sessionId in sessions) {
        // if the session has expired, delete from the sessions object
        if (now - parseInt(sessionId.split('-')[1]) > SESSION_TTL) {
            delete sessions[sessionId];
        }
    }
    //log for testing
    console.log(sessions);
};

//set an interval to run the cleanUpSessions function every n seconds
setInterval(cleanUpSessions, 10 * 1000); // 10 seconds

//-----------------------------------------------------------------------



//VALIDATION CONSTRAINTS//
//<users>: username, password, firstname, surname, email
const usernameConstraints = /^[a-zA-Z0-9_]{1,35}$/;
const passwordConstraints = /^[a-zA-Z0-9_]{1,40}$/;
const firstNameConstraints = /^[a-zA-Z\- ]{1,20}$/;
const surnameConstraints = /^[a-zA-Z\- ]{1,20}$/;
const emailConstraints = /^[a-zA-Z0-9\-.@]{1,50}$/;
//<tournaments>: name, type, tie_break, hide_rating
const tournamentNameConstraints = /^[a-zA-Z_0-9\- ]{1,50}$/;
//<players>: name, club, email
const playerNameConstraints = /^[a-zA-Z\- ]{1,50}$/;
const clubConstraints = /^[a-zA-Z0-9\- ]{1,50}$/;
const playerEmailConstraints = /^[a-zA-Z0-9_.@]{1,50}$/;


//verify user session with the existed sessions
function verifySession(givenSessionID) {
    // check sessionId is not null and present in the sessions object
    if (!givenSessionID || !sessions[givenSessionID]) {
        //if either is false, return false and error message
        return { 
            funcFound: false, 
            funcMessage: "Unexisting session or your session has expired"
        };
    };

    //if session is found, return true and the user ID
    return { 
        funcFound: true, 
        userID: sessions[givenSessionID].userID 
    };
};

//VALIDATION FUNCTIONS//
//validate Tournament Details
function verifyTournamentDetails(name, type, tie_break, hide_rating, bye_value) {
    const KEY = "=PASS="; //used to ignore particular value validation
    //set valid values for ignored parameters
    if (name === KEY) {
        name = "name";
    };
    if (type === KEY) {
        type = "Round-robin";
    };
    if (tie_break === KEY) {
        tie_break = "Sonneborn-Berger";
    };
    if (hide_rating === KEY) {
        hide_rating = false;
    };
    if (bye_value === KEY) {
        bye_value = 0;
    };
    let message = "";
    //check if NOT NULL, (hide rating checked separately)
    if (!name || !type) {
        message = "Required data fields cannot be left empty";
        return { valid: false, message: message };
    };
    //ensure hide_rating is either true or false
    if ( hide_rating !== true && hide_rating !== false) {
        message = "Hide rating can only be true or false";
        return { valid: false, message: message };
    };
    //check tournament name constraints: range and characters
    if ((!tournamentNameConstraints.test(name))) {
        message = "Name exceeds range limit or contains inappropriate characters";
        return { valid: false, message: message };
    };
    //check if type is one of the available types
    if (type !== "Round-robin" && type !== "Swiss System" && type !== "Knockout") {
        message = "Tournament type can only be of the available types";
        return { valid: false, message: message };
    };
    //check if tie_break is one of the available types or null
    if (tie_break !== "Sonneborn-Berger" && tie_break !== "Buchholz Total" && tie_break !== "Buchholz Cut 1" 
        && tie_break !== "Buchholz Cut Median" && tie_break !== null) {
        message = "Tie break can only be of the available types";
        return { valid: false, message: message };
    };
    //check if bye_value meet constraints: 0, 0.5 or 1
    if (bye_value !== 0 && bye_value !== 0.5 && bye_value !== 1) {
        resObject.message = "Bye value must be either 0, 0.5 or 1";
        return { valid: false, message: message };
    };
    //return true if all constraints are met
    return { valid: true, message: message };
};
//validate User Details
function verifyUserDetails(firstName, surname, username, email, password) {
    const KEY = "=PASS="; //used to ignore particular value validation

    //set valid values for ignored parameters
    if (firstName === KEY) {
        firstName = "name";
    };
    if (surname === KEY) {
        surname = "surname";
    };
    if (username === KEY) {
        username = "username";
    };
    if (email === KEY) {
        email = "email@example.com";
    };
    if (password === KEY) {
        password = "password";
    };

    let message = "";

    //check if NOT NULL
    if (!firstName || !surname || !username || !email || !password) {
        message = "Data fields cannot be left empty";
        return { valid: false, message: message };
    };

    //check if username meet constraints: range and characters
    if (!usernameConstraints.test(username)) {
        message = "Invalid username: check that do not exceed range limit and use appropriate characters";
        return { valid: false, message: message };
    };

    //check if password meet constraints: range and characters
    if (!passwordConstraints.test(password)) {
        message = "Invalid password: check that do not exceed range limit and use appropriate characters";
        return { valid: false, message: message };
    };

    //check if first name meet constraints: range and characters
    if (!firstNameConstraints.test(firstName)) {
        message = "Invalid first name: check that do not exceed range limit and use appropriate characters";
        return { valid: false, message: message };
    };

    //check if surname meet constraints: range and characters
    if (!surnameConstraints.test(surname)) {
        message = "Invalid surname: check that do not exceed range limit and use appropriate characters";
        return { valid: false, message: message };
    };

    //check if email meet constraints: range and characters
    if (!emailConstraints.test(email)) {
        message = "Invalid email: check that do not exceed range limit and use appropriate characters";
        return { valid: false, message: message };
    };

    //return true if all constraints are met
    return { valid: true, message: message };
};
//validate Player Details
function verifyPlayerDetails(name, rating, club, email) {
    const KEY = "=PASS="; //used to ignore particular value validation

    //set valid values for ignored parameters
    if (name === KEY) {
        name = "name";
    };
    if (rating === KEY) {
        rating = 0;
    };
    if (club === KEY) {
        club = "-";
    };
    if (email === KEY) {
        email = "email@example.com";
    }

    let message = "";

    //check if NOT NULL
    if (!name || !email) {
        message = "Data fields cannot be left empty";
        return { valid: false, message: message };
    };

    //check if name meet constraints: range and characters
    if (!playerNameConstraints.test(name)) {
        message = "Invalid name: check that do not exceed range limit and use appropriate characters";
        return { valid: false, message: message };
    };

    //check if club meet constraints: range and characters
    if (!clubConstraints.test(club)) {
        message = "Invalid club name: check that do not exceed range limit and use appropriate characters";
        return { valid: false, message: message };
    };

    //check if email meet constraints: range and characters
    if (!playerEmailConstraints.test(email)) {
        message = "Invalid email: check that do not exceed range limit and use appropriate characters";
        return { valid: false, message: message };
    };

    //check if rating meet constraints: range and integer
    if ( rating < 0 || rating > 4000 || !Number.isInteger(rating)) {
        message = "Rating must be an integer between 0 and 4000";
        return { valid: false, message: message };
    };

    //return true if all constraints are met
    return { valid: true, message: message };
};
//validate Entry Details
function verifyEntryDetails(additional_points, eliminated) {
    const KEY = "=PASS="; //used to ignore particular value validation

    //set valid values for ignored parameters
    if (additional_points === KEY) {
        additional_points = 0;
    };
    if (eliminated === KEY) {
        eliminated = false;
    };

    let message = "";

    //check if additional points meet constraints: range and multiple of 0.5
    if (additional_points < 0 || additional_points > 50 || additional_points % 0.5 !== 0) {
        message = "Additional points must be a multiple of 0.5 between 0 and 50";
        return { valid: false, message: message };
    };

    //ensure eliminated is either true or false
    if ( eliminated !== true && eliminated !== false) {
        message = "Eliminated can only be true or false";
        return { valid: false, message: message };
    };

    //return true if all constraints are met
    return { valid: true, message: message };
};

//Authorisation Functions//

//Function: verify requested tournament is assigned to the current user
async function authoriseTournamentAccess(userID, givenTournamentID) {
    try {
        //validate tournament id before sql query
        if (isNaN(givenTournamentID)) {
            return { funcSuccess: false, funcMessage: "Invalid tournament ID" };
        };
        //get the list of tournament ids assigned to the current user
        //user is defined by the user ID passed to the function
        const response = await pool.query(
            "SELECT tournament_id FROM tournaments WHERE user_id = $1",
            [userID]);
        //extract the list of tournament ids from the response
        const tournamentIds = response.rows.map(row => row.tournament_id);
        //compare the requested tournament id to the list
        if (!tournamentIds.includes(parseInt(givenTournamentID))) {
            //if the requested tournament is not in the list, return false and error message
            return { funcSuccess: false, funcMessage: "Unauthorised: attempt to access a tournament not assigned to the current user" };
        } else {
            //otherwise, the tournament requested is assigned to the current user, return true
            return { funcSuccess: true };
        };
    //catch any errors
    } catch (error) {
        console.error(error);
        //return false and error message
        return { funcSuccess: false, funcMessage: "Server Error" };
    };
};

//Function: verify requested forbidden pair is assigned to the current tournament
async function authorisePairAccess(tournamentID, givenPairID, type) {
    try {
        if (isNaN(givenPairID)) {
            return { funcSuccess: false, funcMessage: "Invalid pair ID" };
        };

        let response = null;

        if (type === "forbidden") {
            response = await pool.query(
                "SELECT pair_id FROM forbidden WHERE tournament_id = $1",
                [tournamentID]);

        } else if (type === "predefined"){
            response = await pool.query(
                "SELECT pair_id FROM predefined WHERE tournament_id = $1",
                [tournamentID]);
        };
        
        const pairIds = response.rows.map(row => row.pair_id);
            
        if (!pairIds.includes(parseInt(givenPairID))) {
            return { funcSuccess: false, funcMessage: "Unauthorised: attempt to access a pair not assigned to the current tournament" };
        } else {
            return { funcSuccess: true };
        };

    } catch (error) {
        console.error(error);
        return { funcSuccess: false, funcMessage: "Server Error" };
    };
};

//Function verify requessted round is assigned to the current tournament
async function authoriseRoundAccess(tournamentID, givenRoundID) {
    try {
        if (isNaN(givenRoundID)) {
            return { funcSuccess: false, funcMessage: "Invalid round ID" };
        };

        const response = await pool.query(
            "SELECT round_id FROM rounds WHERE tournament_id = $1",
            [tournamentID]);

        const roundIds = response.rows.map(row => row.round_id);

        if (!roundIds.includes(parseInt(givenRoundID))) {
            return { funcSuccess: false, funcMessage: "Unauthorised: attempt to access a round not assigned to the current tournament" };
        } else {
            return { funcSuccess: true };
        };

    } catch (error) {
        console.error(error);
        return { funcSuccess: false, funcMessage: "Server Error" };
    };
};


//DATA-PREPARING FUNCTIONS//

//Functiion: construct a list of objects that contain the player_id and the count of the number of times it has played white and black separately
async function getPlayersColorCounts(tournamentId) {
    try {

        

        //get the list of players (not-eliminated), for each make a player object with 0 white and black counts
        const players = await pool.query(`SELECT player_id FROM entries WHERE tournament_id = $1`, [tournamentId]);

        //create an object to store all player counts
        const playerCounts = {};
        players.rows.forEach(({ player_id }) => { playerCounts[player_id] = { white: 0, black: 0 } });

        // a row : {player_id: *num*, white_count: *num*, black_count: 0} UNION {player_id: *num*, white_count: 0, black_count: *num*}
        const result = await pool.query(`
            SELECT 
                p.white_player_id AS player_id, 
                COUNT(p.white_player_id) AS white_count, 
                0 AS black_count
            FROM pairings p
            JOIN rounds r ON p.round_id = r.round_id
            WHERE r.tournament_id = $1 AND p.black_player_id IS NOT NULL
            GROUP BY p.white_player_id
        
            UNION ALL
        
            SELECT 
                p.black_player_id AS player_id, 
                0 AS white_count, 
                COUNT(p.black_player_id) AS black_count
            FROM pairings p
            JOIN rounds r ON p.round_id = r.round_id
            WHERE r.tournament_id = $1 AND p.black_player_id IS NOT NULL
            GROUP BY p.black_player_id;`,
            [tournamentId]);

        //add the counts to the player objects
        result.rows.forEach(({ player_id, white_count, black_count }) => {
            //add white count to the player object
            playerCounts[player_id].white += parseInt(white_count, 10);
            //add black count to the player object
            playerCounts[player_id].black += parseInt(black_count, 10);
        });
        //return the object with player counts
        return playerCounts;

    } catch (error) {
        console.error(error.message);
    };
};
//Function: form a list of not eliminated players in the tournament (bye players go first)
async function getNEPlayers(tournamentId) {
    try {

        //get type
        const tournamentDetails = await pool.query(`SELECT type FROM tournaments WHERE tournament_id = $1`, [tournamentId]);

        //get last round
        const lastRoundDetails = await pool.query("SELECT * FROM rounds WHERE tournament_id = $1 ORDER BY round_number DESC LIMIT 1", [tournamentId]);


        //Swiss System 
        if (tournamentDetails.rows[0].type === "Swiss System") {
            
            //get not-eliminated players
            const waitingPlayers = await pool.query(`
                SELECT entries.player_id, players.rating
                FROM entries
                JOIN players ON entries.player_id = players.player_id
                WHERE entries.tournament_id = $1 and entries.eliminated = false;`
            , [tournamentId]);

            let waitingPlayers_list = waitingPlayers.rows;

            ///////////// sort by rating, if no rounds were created //////////////////////////////////////

            //if no rounds have been played
            if (lastRoundDetails.rows.length === 0){
                //sort by rating in descending order
                waitingPlayers_list.sort((a, b) => {
                    return b.rating - a.rating;
                });

                let ids = [];
                //extract player ids
                for (let i = 0; i < waitingPlayers_list.length; i++){
                    ids.push(waitingPlayers_list[i].player_id);
                };
                //return the list of player ids
                return ids;
            };

            ////////////////////// sort by rating, points, and byes ////////////////////////////////////////////

            //////prepare data in form: [{ player_id: 13, rating: 1212, points: 0, bye: true }, ... ]///////////

            //get cumulative scores
            const playersPts = await getPlayersCumulativePoints(tournamentId, lastRoundDetails.rows[0].round_number + 1);
            
            //form an obhect {'id': boolean}, where id is a player id and boolean value represents if the player has had a bye last round
            const resultsData = await pool.query(`
                SELECT white_player_id, result
                FROM pairings
                WHERE round_id = $1;`,
                [lastRoundDetails.rows[0].round_id]);

            let playersResults = {};

            for (let k = 0; k < resultsData.rows.length; k++){
                playersResults[resultsData.rows[k].white_player_id] = resultsData.rows[k].result;
            };

            let playerANDresultsArray = waitingPlayers_list;

            // prepare main list of objects to be sorted
            for (let i = 0; i < playerANDresultsArray.length; i++){
                //add points to each object
                playerANDresultsArray[i]['points'] = playersPts[playerANDresultsArray[i].player_id];

                //set booleans indicating bye results
                if (playersResults[playerANDresultsArray[i].player_id] !== undefined){

                    if (playersResults[playerANDresultsArray[i].player_id] === 'bye'){
                        playerANDresultsArray[i]['bye'] = true;
                    } else {
                        playerANDresultsArray[i]['bye'] = false;
                    }

                } else {
                    playerANDresultsArray[i]['bye'] = false;
                };
                
            };



            ////////////////// sort; priority descend: points -> bye -> rating///////////////////

            
            playerANDresultsArray.sort((a, b) =>{
                //if points are equal
                if (a.points === b.points){
                    //sort by bye
                    //swap, if a has bye and b does not
                    if (a.bye && !b.bye) return -1 ;
                    //swap if b has bye and a does not
                    if (!a.bye && b.bye) return 1 ;
                    //if bye is equal, sort by rating in descending order
                    return b.rating - a.rating ; 
                //otherwise, sort by points in descending order
                } else {
                    return b.points - a.points;
                };
            });
            
            let ids = [];
            //extract player ids
            for (let i = 0; i < playerANDresultsArray.length; i++){
                ids.push(playerANDresultsArray[i].player_id);
            };
            //return the list of player ids
            return ids;

        //Round-Robin and Knockout => fetch players, position bye players at the very top
        } else {
            
            //form a list of not-eliminated player ids
            const getPlayers = await pool.query(
                "SELECT player_id FROM entries WHERE tournament_id = $1 AND eliminated = false;",
                [tournamentId]
            );
            //extract player ids
            let list_of_players = getPlayers.rows.map((player) => player.player_id);

            //if no rounds have been played, return list_of_players
            if (lastRoundDetails.rows.length === 0) {
                return list_of_players;
            };

            //get all pairings from last round that has result of bye
            const byePlayers = await pool.query(
                "SELECT white_player_id FROM pairings WHERE round_id = $1 AND result = 'bye';",
                [lastRoundDetails.rows[0].round_id]
            );
            //get the list of player ids that have had a bye last round
            const bye_player_ids = byePlayers.rows.map((player) => player.white_player_id);
            //remove bye players from list_of_players
            list_of_players = list_of_players.filter((player) => !bye_player_ids.includes(player));
            //put all bye players at the beginning of the list
            const sortedlist = bye_player_ids.concat(list_of_players);
            //return sorted list
            return sortedlist;

        };


        

    } catch (error) {
        console.error(error);
    };
};
//Function: form a list of objects to show what opponents has each player faced
async function getPlayersOpponents(tournamentId) {
    try {

        //form list of players (not-eliminated), for each make a empty list of opponents
        const players = await pool.query(`SELECT player_id FROM entries WHERE tournament_id = $1`, [tournamentId]);
        const playerOpponents = {};
        players.rows.forEach(({ player_id }) => { playerOpponents[player_id] = []});


        const result = await pool.query(`
            SELECT 
                p.white_player_id AS player_id, 
                p.black_player_id AS opponent_id
            FROM pairings p
            JOIN rounds r ON p.round_id = r.round_id
            WHERE r.tournament_id = $1 AND p.black_player_id IS NOT NULL
            
            UNION ALL
            
            SELECT 
                p.black_player_id AS player_id, 
                p.white_player_id AS opponent_id
            FROM pairings p
            JOIN rounds r ON p.round_id = r.round_id
            WHERE r.tournament_id = $1 AND p.black_player_id IS NOT NULL;`, 
            [tournamentId]);

        //fill the list of opponents for each player
        result.rows.forEach(({ player_id, opponent_id }) => { playerOpponents[player_id].push(opponent_id) });
        //return the object with player opponents
        return playerOpponents;

    } catch (error) {
        console.error(error);
    }
};
//Function: form an object of player ids with their total points
async function getPlayersCumulativePoints(tournamentId, roundNumber) {
    try {
        //get tournament bye value using tournament id
        const byeValue = await pool.query(
            "SELECT bye_value FROM tournaments WHERE tournament_id = $1",
            [tournamentId]
        );

        const result = await pool.query(`
                SELECT 
                    p.white_player_id AS player_id,
                    CASE 
                        WHEN p.result = '1-0' THEN 1.0 
                        WHEN p.result = '1/2-1/2' THEN 0.5 
                        WHEN p.result = 'bye' THEN $1
                        ELSE 0.0 
                    END AS points
                FROM pairings p
                JOIN rounds r ON p.round_id = r.round_id
                WHERE r.tournament_id = $2 AND r.round_number < $3

                UNION ALL

                SELECT 
                    p.black_player_id AS player_id,
                CASE 
                    WHEN p.result = '0-1' THEN 1.0 
                    WHEN p.result = '1/2-1/2' THEN 0.5
                    ELSE 0.0 
                END AS points
                FROM pairings p
                JOIN rounds r ON p.round_id = r.round_id
                WHERE r.tournament_id = $2 AND r.round_number < $3 AND p.black_player_id iS NOT NULL;`,
            [byeValue.rows[0].bye_value, tournamentId, roundNumber]);

        //create an object to store all added player points
        const playerPoints = {};
        //iterate through the results
        result.rows.forEach(({ player_id, points }) => {
            //if player_id is not in the object yet, add it with 0.0 points
            if (!playerPoints[player_id]) {
                playerPoints[player_id] = 0.0;
            }
            //add the points to the player_id
            playerPoints[player_id] += parseFloat(points);
        });

        return playerPoints;
    } catch (error) {
        console.error(error);
    };
};


// Main Funtionality Functions //

//Function: validate and update results of last round //return {funcSuccess: success, funcMessage: message}
async function updateLastRoundResults(resultsArray, tournamentID) {
    //variables
    let error = null
    let message = "";
    let success = null;  

    try {
        //validate resultsArray
        resultsArray.forEach(([pairing_id, result]) => {
            //check if pairing_id is a number and result is one of the valid results
            //if not, set error message and success to false
            if (isNaN(pairing_id) || (result !== "1-0" && result !== "0-1" && result !== "1/2-1/2")){
                //set error message and success to false
                message = "Invalid result details";
                //if the some result was not simply provided
                if (result === "-"){
                    //reset error message to "Result cannot be left empty"
                    message = "Result cannot be left empty";
                };
                success = false;
                error = true;
            };
        });
        if (error === true){
            return {funcSuccess: success, funcMessage: message};
        };


        //form a list of corresponding pairing ids (of last round, exluding byes) to given user id
        const lastPairings = await pool.query(`
            SELECT pairings.pairing_id, pairings.white_player_id, pairings.black_player_id
            FROM pairings
            JOIN rounds ON pairings.round_id = rounds.round_id
            WHERE rounds.tournament_id = $1
            AND rounds.round_number = (
                SELECT MAX(r.round_number)
                FROM rounds r
                WHERE r.tournament_id = $1
            )
            AND pairings.result != 'bye';`, 
            [tournamentID]);
        
        const requiredPairingIds = lastPairings.rows.map(row => row.pairing_id);

        //prepare query statement
        let cases_list = []
        let ids_list = []
        resultsArray.forEach(([pairing_id, result]) => {
                //to be used in the query to determine which pairing to update
                //and what result to set
                cases_list.push(`WHEN pairing_id = ${pairing_id} THEN '${result}'`);
                //to be used in the query to determine which pairings to update
                ids_list.push(pairing_id); 
            });

        //verify if all pairings id present (ensures no unexpected pairings are edited and all required pairings are edited)
        if ([...requiredPairingIds].sort((a, b) => a - b).toString() !== [...ids_list].sort((a, b) => a - b).toString()) {
            return {funcSuccess: false, funcMessage: "Invalid pairing id(s) detected"};
        }

        //prepare query by joining the cases_list and ids_list
        const update_results_query = `
            UPDATE pairings 
            SET result = CASE
                ${cases_list.join(' ')}
                ELSE result
            END
            WHERE pairing_id IN (${ids_list.join(', ')});`;

        //sent request to update results
        const setResults = await pool.query(update_results_query);
        return {funcSuccess: true, funcMessage: "Results updated successfully"};

    } catch (err) {
        console.error(err);
        return {funcSuccess: false, funcMessage: "An error occured"};
    };

};

//Function: update elimination status based on pairings results
async function updateEliminationStatus(tournamentId, roundNumber) {
    resObject = { funcSuccess: false, funcMessage: "" };

    try{
        let eliminatedPlayers = [];
        
        //get all the pairings in the tournament
        const pairings = await pool.query(`
            SELECT pairings.* 
            FROM pairings 
            JOIN rounds ON pairings.round_id = rounds.round_id
            WHERE rounds.tournament_id = $1 AND rounds.round_number <= $2`, 
            [tournamentId, roundNumber]);

        //iterate through each pairing
        for (let i = 0; i < pairings.rows.length; i++) {
            const pairing = pairings.rows[i];
            //if pairing result is '0-1'
            if (pairing.result === '0-1') {
                //white_player_id pushed to eliminatedPlayers
                eliminatedPlayers.push(pairing.white_player_id);

            //if pairing result is '1-0'
            } else if (pairing.result === '1-0') {
                //black_player_id pushed to eliminatedPlayers
                eliminatedPlayers.push(pairing.black_player_id);
            };
        };
        
        //convert array to set to remove duplicates
        const eliminatedPlayersSet = new Set(eliminatedPlayers);

        //make a set of players that are not eliminated
        const notEliminatedPlayersSet = new Set();
        const entries = await pool.query(`
            SELECT player_id FROM entries WHERE tournament_id = $1`, 
            [tournamentId]);

        entries.rows.forEach(({ player_id }) => {
            if (!eliminatedPlayersSet.has(player_id)) {
                notEliminatedPlayersSet.add(player_id);
            };
        });

        //set eliminated status to true for all players in eliminatedPlayers
        await pool.query(`
            UPDATE entries 
            SET eliminated = true 
            WHERE player_id = ANY($1) AND tournament_id = $2`, 
            [Array.from(eliminatedPlayersSet), tournamentId]);
        //set eliminated status to false for all players in notEliminatedPlayers
        await pool.query(`
            UPDATE entries 
            SET eliminated = false 
            WHERE player_id = ANY($1) AND tournament_id = $2`, 
            [Array.from(notEliminatedPlayersSet), tournamentId]);

        resObject.funcSuccess = true;
        resObject.funcMessage = "Elimination status updated";
        return resObject;


    } catch (err) {
        console.error(err);
        resObject.funcMessage = "Server error";
        return resObject;
    };
};

//ROUTES//
//Check Session Route
app.get("/check-session", async (req, res) => {
    //returning object
    const resObject = { found: false };

    try {
        //verify session using verifySession function
        const userSession = verifySession(req.headers["session-id"]);
        //if session is not found, return false
        if (!userSession.funcFound) {
            return res.json(resObject);
        //if session is found, return true
        } else {
            resObject.found = true;
            return res.json(resObject);
        };

    // log any error and return false
    } catch (error) {
        console.error(error);
        return res.json(resObject);
    }; 
});
//Login.js Component Route
app.post("/login", async (req, res) => {
    //returning object
    const resObject = { success: false, message: "", session: null};   

    try {

        //recieve passed values
        const { givenUsername, givenPassword } = req.body;

        //verify given credentials
        const validationResult = verifyUserDetails("=PASS=", "=PASS=", givenUsername, "=PASS=", givenPassword);
        if (!validationResult.valid) {
            resObject.message = validationResult.message;
            return res.json(resObject);
        };

        //looks for matches in the database
        const user = await pool.query(
            "SELECT * FROM users WHERE username = $1 AND password = $2",
            [givenUsername, givenPassword]
        );
        //if a match is not found, return error message
        if (user.rows.length === 0) {
            resObject.message = "User has not been found or incorrect password";
            return res.json(resObject);
        }; 
            
        //create a sessionID, store in server-side object and return to client
        const sessionID = `${givenUsername}-${Date.now()}`;
        sessions[sessionID] = {userID: user.rows[0].user_id};
        resObject.session = sessionID;

        resObject.success = true;
        resObject.message = "User has been found";
        return res.json(resObject);

    // log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    };
});
//Singup.js Component Route
app.post("/signup", async (req, res) => {
    //returning object
    const resObject = { success: false, message: "" };

    try {

        // recieve passed values
        const { firstName, surname, username, email, password } = req.body;
        //check if meet constraints
        const validationResult = verifyUserDetails(firstName, surname, username, email, password);
        if (!validationResult.valid) {
            resObject.message = validationResult.message;
            return res.json(resObject);
        };
    
        //check if username alredy exists
        const usernameCheck = await pool.query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        );
        //if any rows are found, return error message
        if (usernameCheck.rows.length > 0) {
            resObject.message = "This username is already taken";
            return res.json(resObject);
        };
        

        //check if email already exists with
        const emailCheck = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );
        //if any rows are found, return error message
        if (emailCheck.rows.length > 0) {
            resObject.message = "Account with this email already exists";
            return res.json(resObject);
        };
        

        //insert new user if previous checks are passed
        const newUser = await pool.query(
            `INSERT INTO users (username, password, firstname, surname, email) 
            VALUES ($1, $2, $3, $4, $5) `,
            [username, password, firstName, surname, email]
        );
        //return success message and success value true
        resObject.success = true;
        resObject.message = "Account has been created";
        return res.json(resObject);

    // log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    };
});
//Dashboard.js Component Route
app.get("/fetch-tournaments", async (req, res) => {
    //returning object
    const resObject = { success: false, found: false, message: "", tournaments: null };

    try {

        //verify that the request is authorised
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        } else {
            resObject.found = true;
        };

        //get the tournaments using user id from the session function return
        const tournaments = await pool.query(
            "SELECT * FROM tournaments WHERE user_id = $1",
            [userSession.userID]
        );

        // Define the desired order
        const statusOrder = { "initialised": 1, "started": 2, "finished": 3 };
        // Sort tournaments based on status
        resObject.tournaments = tournaments.rows.sort((item1, item2) => {
            //swap items if status object number of item1 is greater than of item2
            return (statusOrder[item1.status]) - (statusOrder[item2.status]);
        });

        resObject.success = true;
        resObject.message = "Tournaments have been found";
        return res.json(resObject);

    // log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    };
});
//TournamentSettings.js and TournamentRounds.js Component Route: fetch tournament details (can be used in other components)
app.get("/tournament/:id/fetch-details", async (req, res) => {
    //returning object
    const resObject = { found: false, success: false, message: "", details: null};

    try {

        //verify that the request is authorised
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        } else {
            resObject.found = true;
        };

        //get the id from the URL params , check if the tournament is assigned to the current user
        const { id } = req.params;
        
        const authorised = await authoriseTournamentAccess(userSession.userID, id);
        if (!authorised.funcSuccess) {
            resObject.message = authorised.funcMessage;
            return res.json(resObject);
        };

    
        //get the tournament details
        const response = await pool.query("SELECT * FROM tournaments WHERE tournament_id = $1", [id]);
        const tournament = response.rows[0];

        resObject.success = true;
        resObject.message = "Tournament details have been found";
        resObject.details = tournament;
        return res.json(resObject);
        

    // log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    };
});
//Account.js Component Route: fetch user details
app.get("/account", async (req, res) => {
    //returning object
    const resObject = { found: false, success: false, message: "", user: null };
    try {
        //verify that the request is authorised
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        //if session is found, set found to true and continue
        } else {
            resObject.found = true;
        };
        //get the user details from the database, using userID from the session function return
        const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [userSession.userID]);
        resObject.user = user.rows[0]
        //return success message and success value true
        resObject.success = true;
        resObject.message = "User details have been found";
        return res.json(resObject);
    // log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    };
});


//Account.js Component Route: logout
app.post("/logout", async (req, res) => {
    //returning object
    const resObject = { found: false, success: false, message: "" };
    try {
        //verify that the request is authorised
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        //if session is found, set found to true and continue
        } else {
            resObject.found = true;
        };
        //delete session from server-side object
        delete sessions[req.headers["session-id"]];
        //return success message and success value true
        resObject.success = true;
        resObject.message = "Logged out";
        return res.json(resObject);
    // log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    };
});


//Account.js Component Route: update user details
app.put("/update-user-details", async (req, res) => {
    //returning object
    const resObject = { found: false, success: false, message: "" };
    try {
        //verify that the request is authorised
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        //if session is found, set found to true and continue
        } else {
            resObject.found = true;
        };
        //recieve passed values from the body 
        const { email, surname, firstName } = req.body;
        //validate user details, using validaing function and ignoring password and username
        const validationResult = verifyUserDetails(firstName, surname, "=PASS=", email, "=PASS=");
        if (!validationResult.valid) {
            resObject.message = validationResult.message;
            return res.json(resObject);
        };
        //check if the email already exists in the database
        const emailCheck = await pool.query(
            "SELECT * FROM users WHERE email = $1 AND user_id != $2",
            [email, userSession.userID]
        );
        //if any rows found, return error message 
        if (emailCheck.rows.length > 0) {
            resObject.message = "Account with this email already exists";
            return res.json(resObject);
        };
        //update user details, using userID from the session function return
        const updatedUser = await pool.query(
            "UPDATE users SET email = $1, surname = $2, firstname = $3 WHERE user_id = $4",
            [email, surname, firstName, userSession.userID]
        );
        //return success message and success value true
        resObject.success = true;
        resObject.message = "Details have been updated";
        return res.json(resObject);
    // log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    };
});


//Account.js Component Route: update password
app.put("/update-password", async (req, res) => {
    //returning object
    const resObject = { found: false, success: false, message: "" };
    try {
        //verify that the request is authorised
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        //if session is found, set found to true and continue
        } else {
            resObject.found = true;
        };
        //receive passed values
        const { password, newPassword } = req.body;
        //validate old password using regular expression and check if it is not empty
        if (!passwordConstraints.test(password) || !password) {
            resObject.message = "Invalid old password";
            return res.json(resObject);
        };
        //validate new password using regular expression and check if it is not empty
        if (!passwordConstraints.test(newPassword) || !newPassword) {
            resObject.message = "Invalid new password";
            return res.json(resObject);
        };
        //check if old password matches the one in the database, using userID
        const user = await pool.query("SELECT * FROM users WHERE user_id = $1 AND password = $2",
                                     [userSession.userID, password]);
        //if no rows are found (did not match), return error message
        if (user.rows.length === 0) {
            resObject.message = "Old password is incorrect";
            return res.json(resObject);
        };
        //update user password in the database, using userID from the session function return
        const updatedUser = await pool.query("UPDATE users SET password = $1 WHERE user_id = $2",
                                            [newPassword, userSession.userID]);
        //return success message and success value true
        resObject.success = true;
        resObject.message = "Password has been updated";
        return res.json(resObject);
    //log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    };
});


//Account.js Component Route: delete the user
app.delete("/delete-user", async (req, res) => {
    //returning object
    const resObject = { found: false, success: false, message: "" };
    try {
        //verify that the request is authorised
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        } else {
            resObject.found = true;
        };
        //delete session from server-side object
        delete sessions[req.headers["session-id"]];
        //delete user from the database, using userID from the session function return
        const deleteUser = await pool.query("DELETE FROM users WHERE user_id = $1", [userSession.userID]);
        resObject.success = true;
        resObject.message = "Account has been deleted";
        return res.json(resObject);
    // log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    };
});


//CreateTournament.js Component Route
app.post("/create-tournament", async (req, res) => {
    //returning object
    const resObject = { found: false, success: false, message: "", tournament_id: null };
    try{
        //receive passed values
        let { name, type, tie_break, hide_rating, bye_value } = req.body;
        //verify that the request is authorised
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        } else {
            resObject.found = true;
        };
        //define settings if knockout: bye_value = 0, tie_break = null
        if (type === "Knockout"){ bye_value = 0; tie_break = null; };
        //define settings if round-robin: bye_value = 0
        if (type === "Round-robin"){ bye_value = 0 };
        //validate tournament details
        console.log(name, type, tie_break, hide_rating, bye_value);
        const validationResult = verifyTournamentDetails(name, type, tie_break, hide_rating, bye_value);
        if (!validationResult.valid) {
            resObject.message = validationResult.message;
            return res.json(resObject);
        };
        //insert new tournament into tournaments table and return the tournament_id
        const newTournament = await pool.query(
            `INSERT INTO tournaments 
            (user_id, name, type, bye_value, tie_break, hide_rating, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING tournament_id`,
            [userSession.userID, name, type, bye_value, tie_break, hide_rating, 'initialised']
        );
        //return success message and success value true
        resObject.success = true;
        resObject.message = "Tournament has been created";
        resObject.tournament_id = newTournament.rows[0].tournament_id;
        return res.json(resObject);
    // log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    };
});

//TournamentSettings.js Component Route: update Tournament Details
app.put("/tournament/:id/update-details", async (req, res) => {
    //returning object
    const resObject = { found: false, success: false, message: "" };

    try {

        //verify that the request is authorised
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        } else {
            resObject.found = true;
        };

        //get the id from the URL params, check if the tournament is assigned to the current user
        const { id } = req.params;
        //call authoriseTournamentAccess function to check if the user is authorised to access the tournament
        const authorised = await authoriseTournamentAccess(userSession.userID, id);
        //if user is not authorised, return error message
        if (!authorised.funcSuccess) {
            resObject.message = authorised.funcMessage;
            return res.json(resObject);
        };
        

        //receive passed values
        let { name, type, bye_value, hide_rating } = req.body;

            
        //define settings if knockout
        if (type === "Knockout"){
            bye_value = 0;
            tie_break = null;
        };

        //define settings if round-robin
        if (type === "Round-robin"){
            bye_value = 0     
        };


        //validate tournament details
        const validationResult = verifyTournamentDetails(name, "=PASS=", "=PASS=", hide_rating, bye_value);
        //if validation fails, return error message
        if (!validationResult.valid) {
            resObject.message = validationResult.message;
            return res.json(resObject);
        };

        
        //update tournament details
        const updatedTournament = await pool.query(
            `UPDATE tournaments 
            SET name = $1, bye_value = $2, hide_rating = $3
            WHERE tournament_id = $4`,
            [name, bye_value, hide_rating, id]
        );
        resObject.success = true;
        resObject.message = "Details have been updated";
        return res.json(resObject);

    //catch any errors
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    };
});

//TournamentSettings.js Component Route: delete tournament
app.delete("/tournament/:id/delete", async (req, res) => {
    //returning object
    const resObject = { found: false, success: false, message: "" };

    try {

        //verify that the request is authorise
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        } else {
            resObject.found = true;
        };

        //get the id from the URL params, check if the tournament is assigned to the current user
        const { id } = req.params;
        const authorised = await authoriseTournamentAccess(userSession.userID, id);
        if (!authorised.funcSuccess) {
            resObject.message = authorised.funcMessage;
            return res.json(resObject);
        };
        
    
        //delete tournament
        const deleteTournament = await pool.query("DELETE FROM tournaments WHERE tournament_id = $1", [id]);
        resObject.success = true;
        resObject.message = "Tournament has been deleted";
        return res.json(resObject);

    //catch any errors
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    }
});


//TournamentPlayers.js Component Route: fetch players
app.get("/tournament/:id/players", async (req, res) => {
    //returning object
    const resObject = { success: false, found: false, message: "", players: null, tournament: null };

    try {

        //verify that the request is authorise
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        } else {
            resObject.found = true;
        };

        //get the id from the URL params, check if the tournament is assigned to the current user
        const { id } = req.params;
        const authorised = await authoriseTournamentAccess(userSession.userID, id);
        if (!authorised.funcSuccess) {
            resObject.message = authorised.funcMessage;
            return res.json(resObject);
        };

        //if user is authorised, get the players list for the current tournament using the tournament id
        const players = await pool.query(
            `SELECT players.player_id, players.name, players.rating, players.club, entries.additional_points, entries.eliminated
            FROM players JOIN entries ON players.player_id = entries.player_id 
            WHERE entries.tournament_id = $1`,
            [id]
        );
        //return the players list back to the client
        resObject.players = players.rows;

        const tournament = await pool.query("SELECT * FROM tournaments WHERE tournament_id = $1", [id]);
        resObject.tournament = tournament.rows[0];

        resObject.success = true;
        resObject.message = "Players have been found";
        return res.json(resObject);

    // log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    }
});


//TournamentPlayers.js Component Route: create new player
app.post("/tournament/:id/create-player", async (req, res) => {
    //returning object
    const resObject = { found: false, success: false, message: "" };

    try {

       //verify that the request is authorise
       const userSession = verifySession(req.headers["session-id"]);
       if (!userSession.funcFound) {
           resObject.message = userSession.funcMessage;
           return res.status(401).json(resObject);
       } else {
           resObject.found = true;
       };

       //get the id from the URL params          , check if the tournament is assigned to the current user
       const { id } = req.params;
       const authorised = await authoriseTournamentAccess(userSession.userID, id);
       if (!authorised.funcSuccess) {
           resObject.message = authorised.funcMessage;
           return res.json(resObject);
       };

        //receive passed values
        let { name, rating, club, email, additional_points } = req.body;

        //convert some values to default if null
        if (!rating) { rating = 0 };
        if (!club) { club = "-" };
        if (!additional_points) { additional_points = 0 };


        //check if player details meet constraints
        const validationResult = verifyPlayerDetails(name, rating, club, email);
        //if validation was not successful return appropriate error
        if (!validationResult.valid) {
            resObject.message = validationResult.message;
            return res.json(resObject);
        };
        //check if entry details meet constraints (ignore eliminated as set to FALSE for every player)
        const entryValidationResult = verifyEntryDetails(additional_points, "=PASS=");
        //if validation was not successful return appropriate error
        if (!entryValidationResult.valid) {
            resObject.message = entryValidationResult.message;
            return res.json(resObject);
        };

        //check if player with the given email already exists
        const existingPlayer = await pool.query("SELECT * FROM players WHERE email = $1;", [email]);
        //if any rows were fetched (implying email already exists), return error
        if (existingPlayer.rows.length > 0) {
            resObject.message = "Player with this email already exists in the database. Use 'Seach and Add' to add the player to the tournament";
            return res.json(resObject);
        };

        //create new player, <created_by> is get from the session
        const newPlayer = await pool.query(
            `INSERT INTO players (name, rating, club, email, created_by) 
            VALUES ($1, $2, $3, $4, $5) RETURNING players.player_id;`
            , [name, rating, club, email, userSession.userID]
        );

        //create new entry
        const newEntry = await pool.query(
            "INSERT INTO entries (tournament_id, player_id, additional_points, eliminated) VALUES ($1, $2, $3, $4);",
            [id, newPlayer.rows[0].player_id, additional_points, false]
        );

        resObject.success = true;
        resObject.message = "Player has been added";
        return res.json(resObject);
    
    //catch any errors
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    };
});


//TournamentPlayers.js Component Route: add existing player
app.post("/tournament/:id/add-existing-player", async (req, res) => {
    //returning object
    const resObject = { found: false, success: false, message: "" };

    try {
        
        //verify that the request is authorise
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        } else {
            resObject.found = true;
        };

        //get the id from the URL params, check if the tournament is assigned to the current user
        const { id } = req.params;
        const authorised = await authoriseTournamentAccess(userSession.userID, id);
        if (!authorised.funcSuccess) {
            resObject.message = authorised.funcMessage;
            return res.json(resObject);
        };


        const { email } = req.body;

        //check if email meet constraints
        const validationResult = verifyPlayerDetails("=PASS=", "=PASS=", "=PASS=", email);
        if (!validationResult.valid) {
            resObject.message = validationResult.message;
            return res.json(resObject);
        };


        //check if player exists with this email
        const findPlayer = await pool.query("SELECT player_id FROM players WHERE email = $1;", [email]);

        if (findPlayer.rows.length === 0) {
            resObject.message = "Player with this email does not exist in the database";
            return res.json(resObject);
        }
        const player_id = findPlayer.rows[0].player_id;

        //check if player is already in the tournament
        const existingEntry = await pool.query("SELECT * FROM entries WHERE player_id = $1 AND tournament_id = $2;", [player_id, id]);

        if (existingEntry.rows.length > 0) {
            resObject.message = "Player is already in the tournament";
            return res.json(resObject);
        }

        //insert new entry otherwise
        const newEntry = await pool.query(
            "INSERT INTO entries (tournament_id, player_id, additional_points, eliminated) VALUES ($1, $2, $3, $4);",
            //additional points and eliminated are 0 and false by default respectively
            [id, player_id, 0, false]
        );

        resObject.success = true;
        resObject.message = "Player has been added";
        return res.json(resObject);

    // log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    }
});


//TournamentPlayers.js Component Route: fetch player details
app.post("/tournament/:id/fetch-player-details", async (req, res) => {
    //returning object
    const resObject = { found: false, success: false, message: "", player: null };

    try {
        
        //verify that the request is authorise
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        } else {
            resObject.found = true;
        };

        //get the id from the URL params, check if the tournament is assigned to the current user
        const { id } = req.params;
        const authorised = await authoriseTournamentAccess(userSession.userID, id);
        if (!authorised.funcSuccess) {
            resObject.message = authorised.funcMessage;
            return res.json(resObject);
        };


        //get the player id and verify it is an integer
        const { player_id } = req.body;
        if (isNaN(player_id)) {
            resObject.message = "Invalid player ID";
            return res.json(resObject);
        };

        //get player and entry details
        const player = await pool.query(
            `SELECT players.*, entries.additional_points, entries.eliminated 
            FROM players JOIN entries 
            ON players.player_id = entries.player_id 
            WHERE players.player_id = $1 AND entries.tournament_id = $2`,
            [player_id, id]
        );

        resObject.player = player.rows[0];
        resObject.success = true;
        resObject.message = "Player details have been fetched";
        return res.json(resObject);

    // log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    }
});


//TournamentPlayers.js Component Route: edit player, entry details
app.put("/tournament/:id/edit-player-details", async (req, res) => {
    //returning object
    const resObject = { found: false, success: false, message: "" };

    try {
        
        //verify that the request is authorise
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        } else {
            resObject.found = true;
        };

        //get the id from the URL params, check if the tournament is assigned to the current user
        const { id } = req.params;
        const authorised = await authoriseTournamentAccess(userSession.userID, id);
        if (!authorised.funcSuccess) {
            resObject.message = authorised.funcMessage;
            return res.json(resObject);
        };

        //receive passed values
        let { player_id, name, rating, club, additional_points } = req.body;

        
        //check if empty or null
        if (!rating) {
            rating = 0;
        };
        if (!club) {
            club = "-";
        };
        if (!additional_points) {
            additional_points = 0;
        };

        //check if player details meet constraints
        const validationResult = verifyPlayerDetails(name, rating, club, "=PASS=");
        if (!validationResult.valid) {
            resObject.message = validationResult.message;
            return res.json(resObject);
        };

        //check if entry details meet constraints
        const entryValidationResult = verifyEntryDetails(additional_points, "=PASS=");
        if (!entryValidationResult.valid) {
            resObject.message = entryValidationResult.message;
            return res.json(resObject);
        }

        //get the creator of the currently viewed player
        const playerDetails = await pool.query("SELECT * FROM players WHERE player_id = $1", [player_id]);
        const created_by = playerDetails.rows[0].created_by;
        //update player details only if creator (user ID would equal the creator ID)
        if (userSession.userID === created_by) {
            const updatedPlayer = await pool.query(
                "UPDATE players SET name = $1, rating = $2, club = $3 WHERE player_id = $4;",
                [name, rating, club, player_id]
            );
        };

        //update entry details
        const updateEntry = await pool.query(
            "UPDATE entries SET additional_points = $1 WHERE player_id = $2 AND tournament_id = $3",
            [additional_points, player_id, id]
        );

        resObject.success = true;
        resObject.message = "Participant details have been updated";
        return res.json(resObject);

    // log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    };
});


//TournamentPlayers.js Component Route: remove player
app.delete("/tournament/:id/remove-player", async (req, res) => {
    //returning object
    const resObject = { found: false, success: false, message: "" };
    
    try {
        //verify that the request is authorise
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        } else {
            resObject.found = true;
        };

        //get the id from the URL params, check if the tournament is assigned to the current user
        const { id } = req.params;
        const authorised = await authoriseTournamentAccess(userSession.userID, id);
        if (!authorised.funcSuccess) {
            resObject.message = authorised.funcMessage;
            return res.json(resObject);
        };

        //get the player id and verify it is an integer
        const { player_id } = req.body;
        if (isNaN(player_id)) {
            resObject.message = "Invalid player ID";
            return res.json(resObject);
        };

        //delete player from the tournament
        const deleteEntry = await pool.query("DELETE FROM entries WHERE player_id = $1 AND tournament_id = $2;", [player_id, id]);

        //delete forbidden player that contains just removed player
        const deleteForbidden = await pool.query(
            "DELETE FROM forbidden WHERE tournament_id = $1 AND (player_1_id = $2 OR player_2_id = $2);",
            [id, player_id]
        );

        //delete predefined pair that contains just removed player
        const deletePredefined = await pool.query(
            "DELETE FROM predefined WHERE tournament_id = $1 AND (white_player_id = $2 OR black_player_id = $2);",
            [id, player_id]
        );

        resObject.success = true;
        resObject.message = "Player has been removed";
        return res.json(resObject);

    // log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    };
});

//TournamentPlayers.js Component route: fetch all forbidden pairs for this tournament
app.get("/tournament/:id/fetch-forbidden-pairs", async (req, res) => {
    //returning object
    const resObject = { success: false, found: false, message: "", forbidden_pairs: null };

    try {
        //verify that the request is authorise
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        } else {
            resObject.found = true;
        };

        //get the id from the URL params, check if the tournament is assigned to the current user
        const { id } = req.params;
        const authorised = await authoriseTournamentAccess(userSession.userID, id);
        if (!authorised.funcSuccess) {
            resObject.message = authorised.funcMessage;
            return res.json(resObject);
        };

        //get the forbidden pairs
        const forbiddenPairs = await pool.query(
            `SELECT forbidden.pair_id, forbidden.player_1_id, p1.name AS player_1_name, forbidden.player_2_id, p2.name AS player_2_name
            FROM forbidden
            JOIN players p1 ON forbidden.player_1_id = p1.player_id
            JOIN players p2 ON forbidden.player_2_id = p2.player_id
            WHERE forbidden.tournament_id = $1;`,
            [id]
        );

        resObject.forbidden_pairs = forbiddenPairs.rows;
        resObject.success = true;
        resObject.message = "Forbidden pairs have been found";
        return res.json(resObject);

    // log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    };
});

//TournamentPlayers.js Component route: fetch all predefined pairs for this tournament
app.get("/tournament/:id/fetch-predefined-pairs", async (req, res) => {
    //returning object
    const resObject = { success: false, found: false, message: "", predefined_pairs: null };

    try{
        //verify that the request is authorise
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        } else {
            resObject.found = true;
        };

        //get the id from the URL params, check if the tournament is assigned to the current user
        const { id } = req.params;
        const authorised = await authoriseTournamentAccess(userSession.userID, id);
        if (!authorised.funcSuccess) {
            resObject.message = authorised.funcMessage;
            return res.json(resObject);
        };

        //get the predefined pairs
        const predefinedPairs = await pool.query(
            `SELECT predefined.pair_id, predefined.white_player_id, p1.name AS player_1_name, predefined.black_player_id, p2.name AS player_2_name
            FROM predefined
            JOIN players p1 ON predefined.white_player_id = p1.player_id
            JOIN players p2 ON predefined.black_player_id = p2.player_id
            WHERE predefined.tournament_id = $1;`,
            [id]
        );

        resObject.predefined_pairs = predefinedPairs.rows;
        resObject.success = true;
        resObject.message = "Predefined pairs have been found";
        return res.json(resObject);

    // log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    };
});


//TournamentPlayers.js Component Route: add forbidden pair
app.put("/tournament/:id/add-forbidden-pair", async (req, res) => {
    //returning object
    const resObject = { found: false, success: false, message: "" };

    try {
        //verify that the request is authorise
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        } else {
            resObject.found = true;
        };

        //get the id from the URL params, check if the tournament is assigned to the current user
        const { id } = req.params;
        const authorised = await authoriseTournamentAccess(userSession.userID, id);
        if (!authorised.funcSuccess) {
            resObject.message = authorised.funcMessage;
            return res.json(resObject);
        };

        //receive passed values
        const { player_1_id, player_2_id } = req.body;

        //check if empty or null or not integers
        if (!player_1_id || !player_2_id || isNaN(player_1_id) || isNaN(player_2_id)) {
            resObject.message = "Invalid player IDs";
            return res.json(resObject);
        };
        //check if the players are the same
        if (player_1_id === player_2_id) {
            resObject.message = "Players cannot be the same";
            return res.json(resObject);
        };

        //check if the two chosen players already are in a forbidden pair
        //check both cases: pair (1, 2) and pair (2, 1) 
        const existingPair = await pool.query(
            `SELECT * FROM forbidden WHERE tournament_id = $1 
            AND ((player_1_id = $2 AND player_2_id = $3) OR (player_1_id = $3 AND player_2_id = $2));`,
            [id, player_1_id, player_2_id]
        );
        //if any rows selected, then return error
        if (existingPair.rows.length > 0) {
            resObject.message = "Forbidden pair already exists";
            return res.json(resObject);
        };

        // check if the pair already exists in predefined pairs
        const existingPredefinedPair = await pool.query(
            `SELECT * FROM predefined WHERE tournament_id = $1 
            AND ((white_player_id = $2 AND black_player_id = $3) OR (white_player_id = $3 AND black_player_id = $2));`
            ,[id, player_1_id, player_2_id]
        );
        //if any rows selected, then return error
        if (existingPredefinedPair.rows.length > 0) {
            resObject.message = "Pair already exists in predefined pairs";
            return res.json(resObject);
        };


        //get tournament type
        const tournament = await pool.query("SELECT * FROM tournaments WHERE tournament_id = $1", [id]);
        //if knockout
        if (tournament.rows[0].type === "Knockout") {
            //select all data from entries for each player
            const player1 = await pool.query("SELECT * FROM entries WHERE player_id = $1 AND tournament_id = $2"
                , [player_1_id, id]);
            const player2 = await pool.query("SELECT * FROM entries WHERE player_id = $1 AND tournament_id = $2"
                , [player_2_id, id]);
            //if anyone has eliminated status TRUE, error should be returned
            if (player1.rows[0].eliminated || player2.rows[0].eliminated) {
                resObject.message = "One or more players are eliminated";
                return res.json(resObject);
            };
        };

        //add a forbidden pair
        const addForbiddenPair = await pool.query(
            "INSERT INTO forbidden (tournament_id, player_1_id, player_2_id) VALUES ($1, $2, $3);",
            [id, player_1_id, player_2_id]
        );

          
        resObject.success = true;
        resObject.message = "Forbidden pair has been added";
        return res.json(resObject);

    // log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    };
});

//TournamentPlayers.js Component Route: add predefined pair
app.put("/tournament/:id/add-predefined-pair", async (req, res) => {
    //returning object
    const resObject = { found: false, success: false, message: "" };

    try {
        //verify that the request is authorise
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        } else {
            resObject.found = true;
        };

        //get the id from the URL params, check if the tournament is assigned to the current user
        const { id } = req.params;
        const authorised = await authoriseTournamentAccess(userSession.userID, id);
        if (!authorised.funcSuccess) {
            resObject.message = authorised.funcMessage;
            return res.json(resObject);
        };

        //receive passed values
        const { player_1_id, player_2_id } = req.body;

        //check if empty or null or not integers
        if (!player_1_id || !player_2_id || isNaN(player_1_id) || isNaN(player_2_id)) {
            resObject.message = "Invalid player IDs";
            return res.json(resObject);
        };


        //check if the players are the same
        if (player_1_id === player_2_id) {
            resObject.message = "Players cannot be the same";
            return res.json(resObject);
        };

        //check if any player is already in a predefined pair
        const existingPair = await pool.query(
            `SELECT * FROM predefined WHERE tournament_id = $1 
            AND (white_player_id = $2 OR black_player_id = $3 OR white_player_id = $3 OR black_player_id = $2);`
            ,[id, player_1_id, player_2_id]
        );
        //if any rows are found, return error
        if (existingPair.rows.length > 0) {
            resObject.message = "One of the players is already in a predefined pair";
            return res.json(resObject);
        };

        //check if the pair already exists in forbidden pairs
        const existingForbiddenPair = await pool.query(
            `SELECT * FROM forbidden WHERE tournament_id = $1 
            AND ((player_1_id = $2 AND player_2_id = $3) OR (player_1_id = $3 AND player_2_id = $2));`,
            [id, player_1_id, player_2_id]
        );
        //if any rows are found, return error
        if (existingForbiddenPair.rows.length > 0) {
            resObject.message = "Pair already exists in forbidden pairs";
            return res.json(resObject);
        };


        //get tournament type
        const tournament = await pool.query("SELECT * FROM tournaments WHERE tournament_id = $1", [id]);
        //if knockout
        if (tournament.rows[0].type === "Knockout") {
            //select all data from entries for each player
            const player1 = await pool.query("SELECT * FROM entries WHERE player_id = $1 AND tournament_id = $2", [player_1_id, id]);
            const player2 = await pool.query("SELECT * FROM entries WHERE player_id = $1 AND tournament_id = $2", [player_2_id, id]);
            //if anyone has eliminated status TRUE, error should be returned
            if (player1.rows[0].eliminated || player2.rows[0].eliminated) {
                resObject.message = "One of the players is eliminated";
                return res.json(resObject);
            };
        };

        //add a predefined pair
        const addPredefinedPair = await pool.query(
            "INSERT INTO predefined (tournament_id, white_player_id, black_player_id) VALUES ($1, $2, $3);",
            [id, player_1_id, player_2_id]
        );

          
        resObject.success = true;
        resObject.message = "Predefined pair has been added";
        return res.json(resObject);

    // log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    };
});

//TournamentPlayers.js Component Route: remove forbidden pair
app.put("/tournament/:id/remove-forbidden-pair", async (req, res) => {
    //returning object
    const resObject = { found: false, success: false, message: "" };
    
    try {
        //verify that the request is authorise
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        } else {
            resObject.found = true;
        };

        //get the id from the URL params, check if the tournament is assigned to the current user
        const { id } = req.params;
        const authorised = await authoriseTournamentAccess(userSession.userID, id);
        if (!authorised.funcSuccess) {
            resObject.message = authorised.funcMessage;
            return res.json(resObject);
        };

        // receive passed values, check if the pair_id is an integer, verify that the pair is assigned to the tournament
        const { pair_id } = req.body;
        const authorised_pair = await authorisePairAccess(id, pair_id, "forbidden");
        if (!authorised_pair.funcSuccess) {
            resObject.message = authorised_pair.funcMessage;
            return res.json(resObject);
        };


        //remove a forbidden pair
        const removeForbiddenPair = await pool.query("DELETE FROM forbidden WHERE pair_id = $1;", [pair_id]);
          
        resObject.success = true;
        resObject.message = "Forbidden pair has been removed";
        return res.json(resObject);

    // log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    };
});

//TournamentPlayers.js Component Route: remove predefined pair
app.put("/tournament/:id/remove-predefined-pair", async (req, res) => {
    //returning object
    const resObject = { found: false, success: false, message: "" };

    try {
        //verify that the request is authorise
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        } else {
            resObject.found = true;
        };

        //get the id from the URL params, check if the tournament is assigned to the current user
        const { id } = req.params;
        const authorised = await authoriseTournamentAccess(userSession.userID, id);
        if (!authorised.funcSuccess) {
            resObject.message = authorised.funcMessage;
            return res.json(resObject);
        };

        // receive passed values, check if the pair_id is an integer, verify that the pair is assigned to the tournament
        const { pair_id } = req.body;
        const authorised_pair = await authorisePairAccess(id, pair_id, "predefined");
        if (!authorised_pair.funcSuccess) {
            resObject.message = authorised_pair.funcMessage;
            return res.json(resObject);
        };


        //remove a predefined pair
        const removePredefinedPair = await pool.query("DELETE FROM predefined WHERE pair_id = $1;", [pair_id]);
          
        resObject.success = true;
        resObject.message = "Predefined pair has been removed";
        return res.json(resObject);

    // log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    };
});

//TournamentRounds.js Component Route: start tournament
app.put("/tournament/:id/start", async (req, res) => {
    //returning object
    const resObject = { found: false, success: false, message: ""};

    try{
        //verify that the request is authorise
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        } else {
            resObject.found = true;
        };

        //get the id from the URL params, check if the tournament is assigned to the current user
        const { id } = req.params;
        const authorised = await authoriseTournamentAccess(userSession.userID, id);
        if (!authorised.funcSuccess) {
            resObject.message = authorised.funcMessage;
            return res.json(resObject);
        };

        //start the tournament
        const startTournament = await pool.query(
            "UPDATE tournaments SET status = $1 WHERE tournament_id = $2",
            ["started", id]
        );

        resObject.success = true;
        resObject.message = "Tournament has been started";
        return res.json(resObject);

    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    };
});

//TournamentRounds.js Component Route: fetch all rounds
app.get("/tournament/:id/fetch-rounds", async (req, res) => {
    //returning object
    const resObject = { success: false, found: false, message: "", rounds: null };

    try {
        //verify that the request is authorise
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        } else {
            resObject.found = true;
        };

        //get the id from the URL params, check if the tournament is assigned to the current user
        const { id } = req.params;
        const authorised = await authoriseTournamentAccess(userSession.userID, id);
        if (!authorised.funcSuccess) {
            resObject.message = authorised.funcMessage;
            return res.json(resObject);
        };

        //get the rounds
        const rounds = await pool.query(
            "SELECT * FROM rounds WHERE tournament_id = $1 ORDER BY round_number;",
            [id]
        );
        //return the rounds
        resObject.rounds = rounds.rows;
        resObject.success = true;
        resObject.message = "Rounds have been found";
        return res.json(resObject);

    // log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    }
});

//TournamentRounds.js Component Route: fetch round pairings
app.get("/tournament/:id/fetch-round-pairings/:round_id", async (req, res) => {
    //returning object
    const resObject = { success: false, found: false, message: "", pairings: null, round_number: null, last_round_number: null };

    try {
        //verify that the request is authorise
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        } else {
            resObject.found = true;
        };

        //get the id from the URL params, check if the tournament is assigned to the current user
        const { id, round_id } = req.params;
        const authorised = await authoriseTournamentAccess(userSession.userID, id);
        if (!authorised.funcSuccess) {
            resObject.message = authorised.funcMessage;
            return res.json(resObject);
        };
        const authorised_round = await authoriseRoundAccess(id, round_id);
        if (!authorised_round.funcSuccess) {
            resObject.message = authorised_round.funcMessage;
            return res.json(resObject);
        };

        
        const roundDetails = await pool.query("SELECT round_number FROM rounds WHERE round_id = $1;", [round_id]);

        // Get cumulative points for all players
        const playerPoints = await getPlayersCumulativePoints(id, roundDetails.rows[0].round_number);

        const result = await pool.query(`
                SELECT p.pairing_id, p.white_player_id, p.black_player_id, p.result,
                    wp.name AS white_player_name, wp.rating AS white_player_rating,
                    bp.name AS black_player_name, bp.rating AS black_player_rating
                FROM pairings p
                JOIN players wp ON p.white_player_id = wp.player_id
                LEFT JOIN players bp ON p.black_player_id = bp.player_id
                WHERE p.round_id = $1`, 
            [round_id]);
        

        //create an array to store the pairings
        let pairingsList = [];
        //iterate through the rows fetched
        result.rows.forEach(row => {
            //push the row data into the pairingsList array
            pairingsList.push({
                //pairing_id
                pairing_id: row.pairing_id,
                //white player details with cumulative points
                white_player_id: row.white_player_id,
                white_player_name: row.white_player_name,
                white_player_rating: row.white_player_rating,
                white_player_points: playerPoints[row.white_player_id],
                //black player details with cumulative points
                black_player_id: row.black_player_id,
                black_player_name: row.black_player_name,
                black_player_rating: row.black_player_rating,
                black_player_points: playerPoints[row.black_player_id],
                //result
                result: row.result
            });
        });

        //sort pairingsList by sum of player points (bye value exception)
        pairingsList.sort((a, b) => {
            // Compute cumulative points sum for each pairing
            const sumA = (a.white_player_points || 0) + (a.black_player_points || 0);
            const sumB = (b.white_player_points || 0) + (b.black_player_points || 0);
        
            // Check if either pairing has a bye
            const aHasBye = a.black_player_id === null || a.white_player_id === null;
            const bHasBye = b.black_player_id === null || b.white_player_id === null;
        
            // If one pairing has a bye and the other doesn't, move the one with a bye to the end
            if (aHasBye && !bHasBye) return 1;
            if (!aHasBye && bHasBye) return -1;
        
            // Otherwise, sort by the sum of cumulative points in descending order
            return sumB - sumA;
        });

        //select last round number
        const lastRoundNumber = await pool.query("SELECT round_number FROM rounds WHERE tournament_id = $1 ORDER BY round_number DESC LIMIT 1", [id]);

        resObject.last_round_number = lastRoundNumber.rows[0].round_number;
        resObject.success = true; 
        resObject.message = "Pairings have been found";
        resObject.pairings = pairingsList;
        resObject.round_number = roundDetails.rows[0].round_number;
        return res.json(resObject);


    //log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    }
});

app.put("/tournament/:id/finish", async (req, res) => {
    //returning object
    const resObject = { found: false, success: false, message: "" };

    try{

        //verify that the request is authorise
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        } else {
            resObject.found = true;
        };

        //get the id from the URL params, check if the tournament is assigned to the current user
        const { id } = req.params;
        const authorised = await authoriseTournamentAccess(userSession.userID, id);
        if (!authorised.funcSuccess) {
            resObject.message = authorised.funcMessage;
            return res.json(resObject);
        };

        //update results
        const { results_object } = req.body;

        //if empty, no more rounds can be created, finish the tournament
        if (Object.keys(results_object).length !== 0){
            results_array = Object.entries(results_object);
    
            const operationReturn = await updateLastRoundResults(results_array, id);
            if (operationReturn.funcSuccess === false){
                resObject.message = operationReturn.funcMessage;
                return res.json(resObject);
            };
        };
        
        //finish the tournament
        const finishTournament = await pool.query(
            "UPDATE tournaments SET status = $1 WHERE tournament_id = $2",
            ["finished", id]
        );

        resObject.success = true;
        resObject.message = "Tournament has been finished";
        return res.json(resObject);

    // log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    };

    
});

//TournamentRounds.js Component Route: create new round
app.post("/tournament/:id/create-round", async (req, res) => {
    //returning object
    const resObject = { success: false, found: false, message: "", round_id: null, round_number: null };

    try {
        //verify that the request is authorise
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        } else {
            resObject.found = true;
        };

        //get the id from the URL params, check if the tournament is assigned to the current user
        const { id } = req.params;
        const authorised = await authoriseTournamentAccess(userSession.userID, id);
        if (!authorised.funcSuccess) {
            resObject.message = authorised.funcMessage;
            return res.json(resObject);
        };

        /////////get some essential tournament details for type distinquishing and round number, verify doesn't break maximum/////////

        //fetch general details: type
        const fetchTournDetails = await pool.query(`
            SELECT type
            FROM tournaments
            WHERE tournament_id = $1;
            `,
            [id])

        
        const tournamentType = fetchTournDetails.rows[0].type;
        
        const fetchNumRounds = await pool.query(`
            SELECT COUNT(round_id)
            FROM rounds
            WHERE rounds.tournament_id = $1;
            `,
            [id])

        
        const currentRoundNumber = fetchNumRounds.rows[0].count;
        
        
        ////////////////////manage the results, eliminate status (if Knockout), except new round is first round///////////////////

        if (parseInt(currentRoundNumber) !== 0){
            const { results_object } = req.body;

            //if results_object is empty, it means no more rounds can be created
            if (Object.keys(results_object).length === 0){
                resObject.message = "No more rounds can be created";
                return res.json(resObject);
            }; 
                
            const results_array = Object.entries(results_object);

            const operationReturn = await updateLastRoundResults(results_array, id);
            if (operationReturn.funcSuccess === false){
                resObject.message = operationReturn.funcMessage;
                return res.json(resObject);
            };
        };

        //if the tournament is knockout, update elimination status
        if (tournamentType === "Knockout"){
            const operation = updateEliminationStatus(id, currentRoundNumber);
            //if operation failed, return message
            if (operation.funcSuccess === false){
                resObject.message = operation.funcMessage;
                return res.json(resObject);
            };
        };

        /////////////////////////////acquire essentials details before generating new pairings///////////////////////////////////////////

        //generate list of players, their opponents and colour they played
        let list_of_waiting_players = await getNEPlayers(id); // [ id1, id2, id3, ...]
        const colours_data = await getPlayersColorCounts(id); // { id1: { white:2, black:3 }, ...}
        const opponents_data = await getPlayersOpponents(id); // { id1: [id2, id3], ...}

        if (list_of_waiting_players.length < 1){
            resObject.message = "No more rounds can be created";
            return res.json(resObject);
        };

        //get the predefined pairs
        const predefinedPairsRequested = await pool.query(
            `SELECT predefined.white_player_id, predefined.black_player_id
            FROM predefined
            JOIN players p1 ON predefined.white_player_id = p1.player_id
            JOIN players p2 ON predefined.black_player_id = p2.player_id
            WHERE predefined.tournament_id = $1;`,
            [id]
        );
        //store the predefined pairs
        const predPairsList = predefinedPairsRequested.rows; // [ { white_player_id: id1, black_player_id: id2 }, ...]
        //get the forbidden pairs
        const forbiddenPairsRequested = await pool.query(
            `SELECT forbidden.player_1_id, forbidden.player_2_id
            FROM forbidden
            JOIN players p1 ON forbidden.player_1_id = p1.player_id
            JOIN players p2 ON forbidden.player_2_id = p2.player_id
            WHERE forbidden.tournament_id = $1;`,
            [id]
        );
        //store the forbidden pairs
        const forbPairsList = forbiddenPairsRequested.rows; // [ { player_1_id: id1, player_2_id: id2 }, ...]

        ////////////////////////////////////////debug///////////////////////////////////
        
        //check that no eliminated players are in the waiting list
        const getPlayersNEcheck = await pool.query(
            "SELECT player_id FROM entries WHERE tournament_id = $1 AND eliminated = false;",
            [id]
        );
        const notEliminated_ids = getPlayersNEcheck.rows.map((row) => row.player_id)

        //ensure eliminated players are removed from waiting players list
        list_of_waiting_players = list_of_waiting_players.filter((id) => notEliminated_ids.includes(id));
        
        /////////////////////////////////insert into rounds: with next round number, tournament id; return round id///////////////////////////////////
        console.log("list_of_waiting_players:", list_of_waiting_players);
        console.log("colours_data:", colours_data);
        console.log("opponents_data:", opponents_data);
        console.log("predPairsList:", predPairsList);
        console.log("forbPairsList:", forbPairsList);
        
        const nextRoundNumber = parseInt(currentRoundNumber) + 1;

        //create new round
        const newRound = await pool.query(`
            INSERT INTO rounds (tournament_id, round_number)
            VALUES ($1, $2) RETURNING round_id;`,
            [id, nextRoundNumber]);
        //store the new round id
        const newRoundId = newRound.rows[0].round_id

        //////////////////////////////generate new round accordingly to the tournament type/////////////////////////////////////////////////////
        
        let pairings = [];
        let bye_players = [];
    
        //iterate through predefined pairs
        for (let i = 0; i < predPairsList.length; i++) {
            let pair = predPairsList[i];
            //if both players are in the waiting list
            if (list_of_waiting_players.includes(pair.white_player_id) && list_of_waiting_players.includes(pair.black_player_id)) {
                // Add predefined pair to the list of pairings
                pairings.push([pair.white_player_id, pair.black_player_id]);
                // Remove players from the waiting list
                list_of_waiting_players = list_of_waiting_players.filter(id => id !== pair.white_player_id && id !== pair.black_player_id);
            };
        };


        while (list_of_waiting_players.length > 0) {
            //get the first player from the waiting list
            let player = list_of_waiting_players[0];

            //set the opponent to null
            let opponent = null;
            //iterate through the waiting players list to find an opponent for the player
            for (let j = 1; j < list_of_waiting_players.length; j++) {
                //set the potential opponent
                let potentialOpponent = list_of_waiting_players[j];
                // boolean value indicating whether the two players have already played against each other
                let alreadyPlayed = opponents_data[player] && opponents_data[player].includes(potentialOpponent);
                // boolean value indicating whether the two players are forbidden to play against each other
                let isForbidden = forbPairsList.some(fp => (fp.player_1_id === player && fp.player_2_id === potentialOpponent) ||
                                                            (fp.player_2_id === player && fp.player_1_id === potentialOpponent));
                // If the two players have not played against each other and are not forbidden to play against each other, exit the loop
                if (!alreadyPlayed && !isForbidden) {
                    opponent = potentialOpponent;
                    break;
                };
            };

            // If opponent was found, decide the colours; otherwise, set a bye pairing for the player
            if (opponent) {
                //find the difference in the number of white and black games played by the players
                colourDifferencePlayer = colours_data[player].white - colours_data[player].black;
                colourDifferenceOpponent = colours_data[opponent].white - colours_data[opponent].black;

                //compare modulus difference of white and black games played by the players
                //player's difference is more significant (or equal)
                if (Math.abs(colourDifferencePlayer) >= Math.abs(colourDifferenceOpponent)){
                    //player's difference is positive (played white more times than/same as  black)
                    if (colourDifferencePlayer >= 0){
                        //add the pairing to the list of pairings, player plays white
                        pairings.push([opponent, player]);
                    } else {
                        //add the pairing to the list of pairings, player plays black
                        pairings.push([player, opponent]);
                    };
                //opponent's difference is more significant
                } else if (Math.abs(colourDifferencePlayer) < Math.abs(colourDifferenceOpponent)){
                    //opponent's difference is positive (played white more times than/same as  black)
                    if (colourDifferenceOpponent >= 0){
                        //add the pairing to the list of pairings, opponent plays white
                        pairings.push([player, opponent]);
                    } else {
                        //add the pairing to the list of pairings, opponent plays black
                        pairings.push([opponent, player]);
                    };
                };

                
                list_of_waiting_players = list_of_waiting_players.filter(id => id !== player && id !== opponent);

            
            } else {
                // Add player to the list of bye players
                bye_players.push(player);
                // Remove player from the waiting list
                list_of_waiting_players = list_of_waiting_players.filter(id => id !== player);
            };

        };

        // Insert normal pairings into the database
        for (let k = 0; k < pairings.length; k++) {
            let [white, black] = pairings[k];
            await pool.query(`INSERT INTO pairings (round_id, white_player_id, black_player_id, result) VALUES ($1, $2, $3, '-');`, [newRoundId, white, black]);
        };

        // Insert bye pairings into the database
        for (let l = 0; l < bye_players.length; l++) {
            let player = bye_players[l];
            await pool.query(`INSERT INTO pairings (round_id, white_player_id, black_player_id, result) VALUES ($1, $2, NULL, 'bye');`, [newRoundId, player]);
        };

        ///////////////////clear predefined pairs/////////////////////////////////////
        const clearPredefined = await pool.query(
            "DELETE FROM predefined WHERE tournament_id = $1;",
            [id]
        );

        resObject.message = "Results updated successfully";
        resObject.success = true;
        resObject.round_id = newRoundId;
        resObject.round_number = nextRoundNumber;
        return res.json(resObject);

    // log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    }
});


//TournamentRounds.js Component Route: remove last round
app.delete("/tournament/:id/delete-last-round", async (req, res) => {
    //returning object
    const resObject = { success: false, found: false, message: "", last_round_id: null, last_round_number: null, no_rounds_left: false };

    try {

        //verify that the request is authorise
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        } else {
            resObject.found = true;
        };

        //get the id from the URL params, check if the tournament is assigned to the current user
        const { id } = req.params;
        const authorised = await authoriseTournamentAccess(userSession.userID, id);
        if (!authorised.funcSuccess) {
            resObject.message = authorised.funcMessage;
            return res.json(resObject);
        };

        //get the last round id
        const lastRound = await pool.query(
            `SELECT round_id FROM rounds WHERE tournament_id = $1 ORDER BY round_number DESC LIMIT 1;`,
            [id]
        );

        const lastRoundId = lastRound.rows[0].round_id;

        //delete the last round (and pairings)
        const deleteRound = await pool.query("DELETE FROM rounds WHERE round_id = $1;", [lastRoundId]);

        //fetch new last round details
        const newLastRound = await pool.query(
            `SELECT round_id, round_number FROM rounds WHERE tournament_id = $1 ORDER BY round_number DESC LIMIT 1;`,
            [id]
        );

        //if no rounds left, return boolean value that indicates that
        if (newLastRound.rows.length === 0) {
            resObject.no_rounds_left = true; 
        //if there are rounds left, return the new last round details
        } else {
            resObject.last_round_id = newLastRound.rows[0].round_id;
            resObject.last_round_number = newLastRound.rows[0].round_number;
        };

        ///////////////////manage eliminations for knockout tournaments/////////////////////////////
        const tournamentType = await pool.query(
            "SELECT type FROM tournaments WHERE tournament_id = $1;",
            [id]
        );

        //if the tournament is knockout and there are rounds left
        if (tournamentType.rows[0].type === "Knockout" && newLastRound.rows.length > 0){
            //update elimination status
            const operation = updateEliminationStatus(id, newLastRound.rows[0].round_number-1 );
            //if operation failed, return message
            if (operation.funcSuccess === false){
                resObject.message = operation.funcMessage;
                return res.json(resObject);
            };
        };
        
        resObject.success = true;
        resObject.message = "Last round has been removed";
        return res.json(resObject);

    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    };
});

//TournamentStandings.js Component Route: fetch standings
app.get(`/tournament/:id/standings`, async (req, res) => {6
    //returning object
    const resObject = { success: false, found: false, message: "", standings: null };

    try {
        //verify that the request is authorise
        const userSession = verifySession(req.headers["session-id"]);
        if (!userSession.funcFound) {
            resObject.message = userSession.funcMessage;
            return res.status(401).json(resObject);
        } else {
            resObject.found = true;
        };

        //get the id from the URL params, check if the tournament is assigned to the current user
        const { id } = req.params;
        const authorised = await authoriseTournamentAccess(userSession.userID, id);
        if (!authorised.funcSuccess) {
            resObject.message = authorised.funcMessage;
            return res.json(resObject);
        };

        //FORM and SORT STANDINGS
        //fetch data from entries from a given tournament
        const playersData = await pool.query(`
            SELECT entries.player_id, players.name, players.rating FROM entries
            JOIN players ON entries.player_id = players.player_id
            WHERE entries.tournament_id = $1;`, [id]);
        //store it under standings
        let standings = playersData.rows;

        //get last round details
        const lastRoundDetails = await pool.query(`
            SELECT *
            FROM rounds
            WHERE tournament_id = $1
            ORDER BY round_number DESC
            LIMIT 1;
            `, [id]);

        //get additional points for each player from entries
        const entriesData = await pool.query(`
            SELECT player_id, additional_points
            FROM entries
            WHERE tournament_id = $1;`
            , [id]);
        //initialise object for storing additional points
        const additionalPoints = {};
        //store fetched rows in format: {#player_id: *add_points*, ...}
        entriesData.rows.forEach(({ player_id, additional_points }) => {
            additionalPoints[player_id] = additional_points;
        });

        //if empty, no rounds were created yet
        if (lastRoundDetails.rows.length === 0) {
            for (let i = 0; i < standings.length; i++){
                //player total points are only additional points
                standings[i]["player_points"] = additionalPoints[standings[i].player_id];
                //no rounds played (empty list), and no tie break points
                standings[i]["rounds_result"] = [];
                standings[i]["tiebreak_points"] = 0;
            };
      
        } else {
            const lastRoundNumber = lastRoundDetails.rows[0].round_number;

            //get tournament details
            const tournamentDetails = await pool.query(`
                SELECT *
                FROM tournaments
                WHERE tournament_id = $1;
                `, [id]);
            const status = tournamentDetails.rows[0].status;
            const tie_break = tournamentDetails.rows[0].tie_break;

            //decide which round number to consider
            const considerRoundNumber = (status === "finished") ? lastRoundNumber+1 : lastRoundNumber;

            //get cumulative point (tournamentID, lastRoundNumber or lastRoundNumber + 1 (if status is 'finished'))
            const playerPoints = await getPlayersCumulativePoints(id, considerRoundNumber);

            //build a list of objects to be sorted [{ player_id: 12, player_name: "Player 1", player_rating: 1200, points: 5, rounds_result: ["L", "L", "W", "W", "L"], tiebreak_points: 22 }, ...]
            for (let i = 0; i < standings.length; i++){
                let currentPlayer = standings[i];
                currentPlayer["player_points"] = playerPoints[currentPlayer.player_id] + additionalPoints[currentPlayer.player_id];

                let results = [];
                //fetch results from previous rounds
                const resultsData = await pool.query(`
                    SELECT r.round_number, p.result, p.white_player_id, p.black_player_id,
                        CASE 
                            WHEN (p.white_player_id = $1 AND p.result = '1-0') OR 
                                (p.black_player_id = $1 AND p.result = '0-1') THEN 'W'
                            WHEN (p.white_player_id = $1 AND p.result = '0-1') OR 
                                (p.black_player_id = $1 AND p.result = '1-0') THEN 'L'
                            WHEN p.result = '1/2-1/2' THEN 'D'
                            WHEN p.result = 'bye' THEN 'B'
                            ELSE 'U'
                        END AS outcome
                    FROM pairings p
                    JOIN rounds r ON p.round_id = r.round_id
                    WHERE (p.white_player_id = $1 OR p.black_player_id = $1)
                    AND r.tournament_id = $2 AND r.round_number < $3
                    ORDER BY r.round_number ASC;`, 
                    [currentPlayer.player_id, id, considerRoundNumber]);

                //extract ourcomes in a results list      
                resultsData.rows.forEach(({ round_number, result, outcome }) => {
                    results.push(outcome);
                });
                
                //for knockout, cocat a list of "-" to match legth of rounds
                if (results.length < considerRoundNumber - 1){
                    //calculate the difference
                    const diff = (considerRoundNumber - 1) - results.length;
                    //add "-" to the list to match the length
                    for (let j = 0; j < diff; j++){
                        results.push("-");
                    };
                };

                //assign to rounds_result
                currentPlayer["rounds_result"] = results;

                ///////////////////////TIE BREAKS////////////////////////
                let tiebreakPts = 0;

                //decide a tiebreak method
                if (tie_break === "Buchholz Total" || tie_break === "Buchholz Cut 1" || tie_break === "Buchholz Cut Median"){
                    //initialise an array to store buchholz points
                    let buchholz = [];
                    
                    //interate through the results
                    for ( let i = 0; i < resultsData.rows.length; i++){
                        //store the row
                        const row = resultsData.rows[i];
                        //if the current player is white, add the points of the black player to the list
                        if (currentPlayer.player_id === row.white_player_id){
                            buchholz.push(playerPoints[row.black_player_id] || 0);
                        //if the current player is black, add the points of the white player to the list
                        } else {
                            buchholz.push(playerPoints[row.white_player_id] || 0);
                        };
                    };

                    //remove zeroes
                    buchholz = buchholz.filter(x => x !== 0);
                    //sort in descending order
                    buchholz.sort((a, b) => b - a);
                    //if "Cut 1"
                    if (tie_break === "Buchholz Cut 1"){
                        //remove the last element (smallest)
                        buchholz = buchholz.slice(0, -1);
                    };
                    //if "Cut Median"
                    if (tie_break === "Buchholz Cut Median"){
                        //remove first and last element (smallest and largest)
                        buchholz = buchholz.slice(1, -1);
                    };

                    console.log("buchholz:", buchholz);

                    //add up all points
                    buchholz = buchholz.reduce((a, b) => a + b, 0);
                    //assign to tiebreakPts
                    tiebreakPts = buchholz;

                } else if (tie_break === "Sonneborn-Berger"){
                    let sonneborn = 0;

                    //iterate through the game results
                    for ( let i = 0; i < resultsData.rows.length; i++){
                        //store the row
                        const row = resultsData.rows[i];
                        //if the current player won the currently viewed game
                        if (row.outcome === "W"){
                            //add the points of the opponent
                            //opponent played black
                            if (row.result === '1-0'){
                                sonneborn += playerPoints[row.black_player_id];
                            //opponent played white
                            } else if (row.result === '0-1'){
                                sonneborn += playerPoints[row.white_player_id];
                            };
                        };

                        //if the current player drew the currently viewed game
                        if (row.outcome === "D"){
                            //add half of the points of the opponent
                            //opponent played black
                            if (row.white_player_id === currentPlayer.player_id){
                                sonneborn += playerPoints[row.black_player_id] / 2;
                                console.log("sonneborn: +", playerPoints[row.black_player_id] / 2);
                            //opponent played white
                            } else {
                                sonneborn += playerPoints[row.white_player_id] / 2;
                                console.log("sonneborn: +", playerPoints[row.white_player_id] / 2);
                            };
                        };
                    };

                    //assign to tiebreakPts
                    tiebreakPts = sonneborn;
                };

                console.log("tiebreakPts:", tiebreakPts);
                //assign to the player
                currentPlayer["tiebreak_points"] = tiebreakPts;
            };


            //sort standings by player_points, tiebreak_points, player_rating
            //priority -> higher points, higher tiebreak points, lower rating
            standings.sort((a, b) => {
                if (a.player_points === b.player_points) {

                    if (a.tiebreak_points === b.tiebreak_points) {
                        return a.rating - b.rating;
                    } else {
                        return b.tiebreak_points - a.tiebreak_points;
                    }

                } else {
                    return b.player_points - a.player_points;
                };
            });
        };


        resObject.standings = standings;
        resObject.success = true;
        resObject.message = "Standings have been found";
        return res.json(resObject);

    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return res.json(resObject);
    };
});