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

const SESSION_TTL = 10 * 60 * 1000; // 10 minutes

const cleanUpSessions = () => {
    const now = Date.now();
    for (const sessionId in sessions) {
        if (now - parseInt(sessionId.split('-')[1]) > SESSION_TTL) {
            delete sessions[sessionId];
        }
    }
    console.log(sessions);
};

setInterval(cleanUpSessions, 0.5 * 60 * 1000); // 30 seconds

//-----------------------------------------------------------------------



//VALIDATION CONSTRAINTS//

//users: username, password, firstname, surname, email
const usernameConstraints = /^[a-zA-Z0-9_]{1,35}$/;
const passwordConstraints = /^[a-zA-Z0-9_]{1,40}$/;
const firstNameConstraints = /^[a-zA-Z\- ]{1,20}$/;
const surnameConstraints = /^[a-zA-Z\- ]{1,20}$/;
const emailConstraints = /^[a-zA-Z0-9\-.@]{1,50}$/;

//tournaments: name, type, tie_break, max_rounds, max_participants, hide_rating
const tournamentNameConstraints = /^[a-zA-Z_0-9\- ]{1,50}$/;


//players: name, rating, club, email, add_points
const playerNameConstraints = /^[a-zA-Z\- ]{1,50}$/;
const clubConstraints = /^[a-zA-Z0-9\- ]{1,50}$/;
const playerEmailConstraints = /^[a-zA-Z0-9_.@]{1,50}$/;


//Validation Functions

//verify Tournament Details
function verifyTournamentDetails(name, type, tie_break, max_rounds, max_participants, hide_rating) {
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
    if (max_rounds === KEY) {
        max_rounds = 1;
    };
    if (max_participants === KEY) {
        max_participants = 1;
    };
    if (hide_rating === KEY) {
        hide_rating = false;
    };

    let message = "";

    //check if NOT NULL, (hide rating checked separately)
    if (!name || !max_rounds || !max_participants || !type) {
        message = "Data fields cannot be left empty";
        return { valid: false, message: message };
    };

    //check max_rounds constraints: range and integer
    if ( max_rounds < 1 || max_rounds > 50 || !Number.isInteger(max_rounds)) {
        message = "Number of rounds must be an integer between 1 and 50";
        return { valid: false, message: message };
    };

    //check max_participants constraints: range and integer
    if ( max_participants < 1 || max_participants > 1000 || !Number.isInteger(max_participants)) {
        message = "Number of players must be an integer between 1 and 1000";
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
    if (type !== "Round-robin" && type !== "Swiss System" && type !== "Knockout" && type !== null) {
        message = "Tournament type can only be of the available types";
        return { valid: false, message: message };
    };

    //check if tie_break is one of the available types or null
    if (tie_break !== "Sonneborn-Berger" && tie_break !== "Buchholz Total" && tie_break !== "Buchholz Cut 1" && tie_break !== "Buchholz Cut Median" && tie_break !== null) {
        message = "Tie break can only be of the available types";
        return { valid: false, message: message };
    };

    //return true if all constraints are met
    return { valid: true, message: message };
};

//verify User Details
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


//verify Player Details
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


//verify Entry Details
function verifyEntryDetails(additional_points, eliminated) {
    const KEY = "=PASS="; //used to ignore particular value validation

    //set valid values for ignored parameters
    if (additional_points === KEY) {
        additional_points = 0;
    }
    if (eliminated === KEY) {
        eliminated = false;
    };

    let message = "";

    //check if additional points meet constraints: range and multiple of 0.5
    if (additional_points < 0 || additional_points > 50 || additional_points % 0.5 !== 0) {
        resObject.message = "Additional points must be a multiple of 0.5 between 0 and 1000";
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


//Functiion: construct a list of objects that contain the player_id and the count of the number of times it has played white and black separately
async function getPlayerColorCounts(tournamentId) {
    try {
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

      const playerCounts = {};
  
      result.rows.forEach(({ player_id, white_count, black_count }) => {
        if (!playerCounts[player_id]) {
          playerCounts[player_id] = { white: 0, black: 0 };
        };
        playerCounts[player_id].white += parseInt(white_count, 10);
        playerCounts[player_id].black += parseInt(black_count, 10);
      });
  
      return playerCounts;

    } catch (error) {
      console.error(error);
    };
};
  

//Function: form a list of not eliminated players in the tournament
async function getNElimPlayers(tournamentId) {
    try {
        const players = await pool.query(`
            SELECT players.player_id
            FROM players 
            JOIN entries ON players.player_id = entries.player_id
            WHERE entries.tournament_id = $1 AND entries.eliminated = false`,
        [tournamentId]);

        const list = players.rows.map(player => player.player_id);
        return list;

    } catch (error) {
        console.error(error);
    };
};


//Function: form a list of objects to show what opponents has each player faced
async function getPlayerOpponents(tournamentId) {
    try {
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

        const playerOpponents = {};

        result.rows.forEach(({ player_id, opponent_id }) => {
        if (!playerOpponents[player_id]) {
            playerOpponents[player_id] = [];
        }
        playerOpponents[player_id].push(opponent_id);
        });

        return playerOpponents;

    } catch (error) {
        console.error(error);
    }
};


//Function: form a list of player ids with their total points
async function getPlayerCumulativePoints(byeValue, tournamentId, roundNumber) {
    try {
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
                    WHEN p.result = 'bye' THEN $1 
                    ELSE 0.0 
                END AS points
                FROM pairings p
                JOIN rounds r ON p.round_id = r.round_id
                WHERE r.tournament_id = $2 AND r.round_number < $3 AND p.black_player_id iS NOT NULL;`, 
            [byeValue, tournamentId, roundNumber]);

        const playerPoints = {};

        result.rows.forEach(({ player_id, points }) => {
        if (!playerPoints[player_id]) {
            playerPoints[player_id] = 0.0;
        }
        playerPoints[player_id] += parseFloat(points);
        });

        return playerPoints;
    } catch (error) {
        console.error(error);
    };
};


//ROUTES//

//Check Session Route
app.get("/check-session", async (req, res) => {
    //returning object
    const resObject = {
        found: false,
    };

    try {
        //verify that the request is authorised
        const sessionID = req.headers["session-id"];

        //if session is found
        if (sessions[sessionID]) {
            resObject.found = true;
            return res.json(resObject);

        //if session is not found
        } else {
            return res.json(resObject);
        };

    //catch any errors
    } catch (err) {
        console.error(err.message);
        return res.json(resObject);
    };
});

//Login.js Component Route
app.post("/login", async (req, res) => {
    //returning object
    const resObject = {
        success: false,
        message: "",
        session: null
    };

    try {
        //passed values
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

        //if a match is not found
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

    //catch any errors
    } catch (err) {
        console.error(err.message);
    };
});


//Singup.js Component Route
app.post("/signup", async (req, res) => {
    try {
        //returning object
        const resObject = {
            success: false,
            message: ""
        };

        //passed values
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

        if (usernameCheck.rows.length > 0) {
            resObject.message = "This username is already taken";
            return res.json(resObject);
        };
        

        //sql query: check if email already exists with
        const emailCheck = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

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

        resObject.success = true;
        resObject.message = "Account has been created";
        return res.json(resObject);

    //catch any errors
    } catch (err) {
        console.error(err.message);
    };
});


//Dashboard.js Component Route
app.get("/fetch-tournaments", async (req, res) => {
    try {
        //returning object
        const resObject = {
            success: false,
            found: false,
            message: "",
            tournaments: null
        };

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        };
        resObject.found = true;

        //get the userID from the session
        req.userID = sessions[sessionID].userID;


        //get the tournaments using user id
        const tournaments = await pool.query(
            "SELECT * FROM tournaments WHERE user_id = $1",
            [req.userID]
        );
        resObject.tournaments = tournaments.rows;
        resObject.success = true;
        resObject.message = "Tournaments have been found";
        return res.json(resObject);

    //catch any errors
    } catch (err) {
        console.error(err.message);
    };
});


//TournamentSettings.js and TournamentRounds.js Component Route: fetch tournament details (can be used in other components)
app.get("/tournament/:id/fetch-details", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: "",
            details: null
        };

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        };
        resObject.found = true;


        //get the id from the URL and verify it is an integer and verify it is an integer
        const { id } = req.params;
        if (isNaN(id)) {
            resObject.message = "Invalid tournament ID";
            return res.json(resObject);
        };

        //get the tournament details
        const response = await pool.query(
            "SELECT * FROM tournaments WHERE tournament_id = $1",
            [id]
        );
        const tournament = response.rows[0];

        resObject.success = true;
        resObject.message = "Tournament details have been found";
        resObject.details = tournament;
        return res.json(resObject);
        

    //catch any errors
    } catch (err) {
        console.error(err.message);
    };
});


//Account.js Component Route: fetch user details
app.get("/account", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: "",
            user: null
        };

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        //get the userID from the session
        req.userID = sessions[sessionID].userID;

        //get the user details
        const user = await pool.query(
            "SELECT * FROM users WHERE user_id = $1",
            [req.userID]
        );
        resObject.user = user.rows[0]

        resObject.success = true;
        resObject.message = "User details have been found";
        return res.json(resObject);

    //catch any errors
    }catch (err) {
        console.error(err.message);
    }
});


//Account.js Component Route: logout
app.post("/logout", async (req, res) => {
    try{
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: ""
        };

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        };
        resObject.found = true;

        //delete session
        delete sessions[sessionID];

        resObject.success = true;
        resObject.message = "Logged out";
        return res.json(resObject);

    //catch any errors
    } catch (err) {
        console.error(err.message);
    }; 
});


//Account.js Component Route: update user details
app.put("/update-user-details", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: ""
        };

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        //get the userID from the session
        req.userID = sessions[sessionID].userID;

        //passed variables
        const { email, surname, firstName } = req.body;

        //check if meet constraints
        const validationResult = verifyUserDetails(firstName, surname, "=PASS=", email, "=PASS=");
        if (!validationResult.valid) {
            resObject.message = validationResult.message;
            return res.json(resObject);
        };

        //update user details
        const updatedUser = await pool.query(
            "UPDATE users SET email = $1, surname = $2, firstname = $3 WHERE user_id = $4",
            [email, surname, firstName, req.userID]
        );

        resObject.success = true;
        resObject.message = "Details have been updated";
        return res.json(resObject);

    //catch any errors
    } catch (err) {
        console.error(err.message);
    }
})


//Account.js Component Route: update password
app.put("/update-password", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: ""
        };

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        };
        resObject.found = true;

        //get the userID from the session
        req.userID = sessions[sessionID].userID;

        //passed variables
        const { password, newPassword } = req.body;

        //check if password meet constraints
        if (!passwordConstraints.test(password) || !password) {
            resObject.message = "Invalid old password";
            return res.json(resObject);
        };

        //check if new password meet constraints
        if (!passwordConstraints.test(newPassword) || !newPassword) {
            resObject.message = "Invalid new password";
            return res.json(resObject);
        };

        //check if old password matches
        const user = await pool.query(
            "SELECT * FROM users WHERE user_id = $1 AND password = $2",
            [req.userID, password]
        );

        if (user.rows.length === 0) {
            resObject.message = "Old password is incorrect";
            return res.json(resObject);
        };

        //update user password
        const updatedUser = await pool.query(
            "UPDATE users SET password = $1 WHERE user_id = $2",
            [newPassword, req.userID]
        );

        resObject.success = true;
        resObject.message = "Password has been updated";
        return res.json(resObject);

    //catch any errors
    } catch (err) {
        console.error(err.message);
    };
});


//Account.js Component Route: delete the user
app.delete("/delete-user", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: ""
        };

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];

        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        //get the userID from the session
        req.userID = sessions[sessionID].userID;

        //delete user
        const deleteUser = await pool.query(
            "DELETE FROM users WHERE user_id = $1",
            [req.userID]
        );
        resObject.success = true;
        resObject.message = "Account has been deleted";
        return res.json(resObject);

    } catch (err) {
        console.error(err.message);
        resObject.message = "Server Error";

    }
});


//CreateTournament.js Component Route
app.post("/create-tournament", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: "",
            tournament_id: null
        };

        //passed variables
        let { name, type, tie_break, max_rounds, max_participants, hide_rating, bye_value } = req.body;

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        //get the userID from the session
        req.userID = sessions[sessionID].userID;

        //define settings if knockout
        if (type === "Knockout"){
            bye_value = 0;
            tie_break = null;
            //halves every time
            max_rounds =  Math.ceil(Math.log2(max_participants))
        }

        //define settings if round-robin
        if (type === "Round-robin"){
            bye_value = 0
            //max rounds: 3,4 -> 3; 5,6 -> 5
            if (max_participants % 2 === 1){
                max_rounds = max_participants 
            } else {
                max_rounds = max_participants - 1
            }
            if (max_rounds > 50) {
                max_rounds = 50
            }
            
        }
  
        //validate tournament details
        const validationResult = verifyTournamentDetails(name, type, tie_break, max_rounds, max_participants, hide_rating);
        if (!validationResult.valid) {
            resObject.message = validationResult.message;
            return res.json(resObject);
        };


        //insert new tournament
        const newTournament = await pool.query(
            `INSERT INTO tournaments 
            (user_id, name, type, max_rounds, max_participants, bye_value, tie_break, hide_rating, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING tournament_id`,
            [req.userID, name, type, max_rounds, max_participants, bye_value, tie_break, hide_rating, 'initialised']
        );

        resObject.success = true;
        resObject.message = "Tournament has been created";
        resObject.tournament_id = newTournament.rows[0].tournament_id;
        return res.json(resObject);

    } catch (err) {
        console.error(err.message);
    }
});

//TournamentSettings.js Component Route: update Tournament Details
app.put("/tournament/:id/update-details", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: ""
        };

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        //get the userID from the session
        req.userID = sessions[sessionID].userID;

        //get the id from the URL and verify it is an integer
        const { id } = req.params;
        if (isNaN(id)) {
            resObject.message = "Invalid tournament ID";
            return res.json(resObject);
        };

        //passed variables
        let { name, type, max_rounds, max_participants, bye_value, hide_rating } = req.body;

               
        //define settings if knockout
        if (type === "Knockout"){
            bye_value = 0;
            tie_break = null;
            //halves every time
            max_rounds =  Math.ceil(Math.log2(max_participants))
        }

        //define settings if round-robin
        if (type === "Round-robin"){
            bye_value = 0
            //max rounds: 3,4 -> 3; 5,6 -> 5
            if (max_participants % 2 === 1){
                max_rounds = max_participants 
            } else {
                max_rounds = max_participants - 1
            }
            if (max_rounds > 50) {
                max_rounds = 50
            }
            
        }
  

        //validate tournament details
        const validationResult = verifyTournamentDetails(name, "=PASS=", "=PASS=", max_rounds, max_participants, hide_rating);
        if (!validationResult.valid) {
            resObject.message = validationResult.message;
            return res.json(resObject);
        }


        //check that new max_participants is not less than the current number of participants
        const participants = await pool.query(
            "SELECT * FROM entries WHERE tournament_id = $1",
            [id]
        );

        if (participants.rows.length > max_participants) {
            resObject.message = "Number of participants cannot be less than the current number of participants";
            return res.json(resObject);
        };


        //update tournament details
        const updatedTournament = await pool.query(
            `UPDATE tournaments 
            SET name = $1, max_rounds = $2, max_participants = $3, bye_value = $4, hide_rating = $5 
            WHERE tournament_id = $6`,
            [name, max_rounds, max_participants, bye_value, hide_rating, id]
        );
        resObject.success = true;
        resObject.message = "Details have been updated";
        return res.json(resObject);

    //catch any errors
    } catch (err) {
        console.error(err.message);
    }
});

//TournamentSettings.js Component Route: delete tournament
app.delete("/tournament/:id/delete", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: ""
        };

        //get the id from the URL and verify it is an integer
        const { id } = req.params;

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];

        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        //delete tournament
        const deleteTournament = await pool.query(
            "DELETE FROM tournaments WHERE tournament_id = $1",
            [id]
        );
        resObject.success = true;
        resObject.message = "Tournament has been deleted";
        return res.json(resObject);

    //catch any errors
    } catch (err) {
        console.error(err.message);
        resObject.message = "Server Error";
        return res.json(resObject);
    }
});

//TournamentPlayers.js Component Route: fetch players
app.get("/tournament/:id/players", async (req, res) => {
    try {
        //returning object
        const resObject = {
            success: false,
            found: false,
            message: "",
            players: null,
            tournament: null
        };

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        //get the id from the URL and verify it is an integer and verify it is an integer
        const { id } = req.params;
        if (isNaN(id)) {
            resObject.message = "Invalid tournament ID";
            return res.json(resObject);
        };


        //if user is authorised, get the players
        const players = await pool.query(
            `SELECT players.player_id, players.name, players.rating, players.club, entries.additional_points, entries.eliminated
            FROM players JOIN entries ON players.player_id = entries.player_id 
            WHERE entries.tournament_id = $1`,
            [id]
        );
        resObject.players = players.rows;

        const tournament = await pool.query(
            "SELECT * FROM tournaments WHERE tournament_id = $1",
            [id]
        );
        resObject.tournament = tournament.rows[0];

        resObject.success = true;
        resObject.message = "Players have been found";
        return res.json(resObject);

    //catch any errors
    } catch (err) {
        console.error(err.message);
    }
});


//TournamentPlayers.js Component Route: create new player
app.post("/tournament/:id/create-player", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: "",
        };

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        //get the id from the URL and verify it is an integer
        const { id } = req.params;
        if (isNaN(id)) {
            resObject.message = "Invalid tournament ID";
            return res.json(resObject);
        };

        //passed variables
        let { name, rating, club, email, additional_points } = req.body;

        //covert some values to default if null
        if (!rating) {
            rating = 0;
        };
        if (!club) {
            club = "-";
        };
        if (!additional_points) {
            additional_points = 0;
        };


        //get the userID from the session
        req.userID = sessions[sessionID].userID;

       //check if player details meet constraints
        const validationResult = verifyPlayerDetails(name, rating, club, email);
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


        //check if player with the given email already exists
        const existingPlayer = await pool.query(
            "SELECT * FROM players WHERE email = $1;",
            [email]
        );

        if (existingPlayer.rows.length > 0) {
            resObject.message = "Player with this email already exists in the database. Use 'Seach and Add' to add the player to the tournament";
            return res.json(resObject);
        }


        //create new player
        const newPlayer = await pool.query(
            "INSERT INTO players (name, rating, club, email, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING players.player_id;",
            [name, rating, club, email, req.userID]
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
        console.error(err.message);
    }
});


//TournamentPlayers.js Component Route: add existing player
app.post("/tournament/:id/add-existing-player", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: ""
        };

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        };
        resObject.found = true;

        //get the id from the URL and verify it is an integer
        const { id } = req.params;
        if (isNaN(id)) {
            resObject.message = "Invalid tournament ID";
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
        const findPlayer = await pool.query(
            "SELECT player_id FROM players WHERE email = $1;",
            [email]
        );

        if (findPlayer.rows.length === 0) {
            resObject.message = "Player with this email does not exist in the database";
            return res.json(resObject);
        }
        const player_id = findPlayer.rows[0].player_id;

        //check if player is already in the tournament
        const existingEntry = await pool.query(
            "SELECT * FROM entries WHERE player_id = $1 AND tournament_id = $2;",
            [player_id, id]
        );

        if (existingEntry.rows.length > 0) {
            resObject.message = "Player is already in the tournament";
            return res.json(resObject);
        }

        //insert new entry otherwise
        const newEntry = await pool.query(
            "INSERT INTO entries (tournament_id, player_id, additional_points, eliminated) VALUES ($1, $2, $3, $4);",
            [id, player_id, 0, false]
        );

        resObject.success = true;
        resObject.message = "Player has been added";
        return res.json(resObject);

    } catch (err) {
        console.error(err.message);
    }
});


//TournamentPlayers.js Component Route: fetch player details
app.post("/tournament/:id/fetch-player-details", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: "",
            player: null
        };

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        //get the player id and verify it is an integer
        const { player_id } = req.body;
        if (isNaN(player_id)) {
            resObject.message = "Invalid player ID";
            return res.json(resObject);
        };

        //get the id from the URL and verify it is an integer
        const { id } = req.params;
        if (isNaN(id)) {
            resObject.message = "Invalid tournament ID";
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

    } catch (err) {
        console.error(err.message);
    }
});


//TournamentPlayers.js Component Route: edit player, entry details
app.put("/tournament/:id/edit-player-details", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: ""
        };

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        //get the id from the URL and verify it is an integer
        const { id } = req.params;
        if (isNaN(id)) {
            resObject.message = "Invalid tournament ID";
            return res.json(resObject);
        };

        //get the userID from the session
        req.userID = sessions[sessionID].userID;


        let { player_id, name, rating, club, additional_points, created_by } = req.body;

        
        //check if empty or null
        if (!name) {
            resObject.message = "Data field cannot be left empty ";
            return res.json(resObject);
        };
        if (!rating) {
            rating = 0;
        };
        if (!club) {
            club = "-";
        };
        if (!additional_points) {
            additional_points = 0;
        };

        console.log(player_id, name, rating, club, additional_points, created_by)
        console.log(req.userID)

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

        //update player details if creator
        if (req.userID === created_by) {
            const updatedPlayer = await pool.query(
                "UPDATE players SET name = $1, rating = $2, club = $3 WHERE player_id = $4;",
                [name, rating, club, player_id]
            );
            console.log("Itself updated")
        }

        //update entry details
        const updateEntry = await pool.query(
            "UPDATE entries SET additional_points = $1 WHERE player_id = $2 AND tournament_id = $3",
            [additional_points, player_id, id]
        );

        resObject.success = true;
        resObject.message = "Participant details have been updated";
        return res.json(resObject);
    } catch (err) {
        console.error(err.message);
    }
});


//TournamentPlayers.js Component Route: remove player
app.delete("/tournament/:id/remove-player", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: ""
        };

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        };
        resObject.found = true;

        //get the player id and verify it is an integer
        const { player_id } = req.body;
        if (isNaN(player_id)) {
            resObject.message = "Invalid player ID";
            return res.json(resObject);
        };

        //get the id from the URL and verify it is an integer
        const { id } = req.params;
        if (isNaN(id)) {
            resObject.message = "Invalid tournament ID";
            return res.json(resObject);
        };


        //delete player from the tournament
        const deleteEntry = await pool.query(
            "DELETE FROM entries WHERE player_id = $1 AND tournament_id = $2;",
            [player_id, id]
        );

        //delete forbidden player that contains just removed player
        const deleteForbidden = await pool.query(
            "DELETE FROM forbidden WHERE tournament_id = $1 AND (player_1_id = $2 OR player_2_id = $2);",
            [id, player_id]
        );

        resObject.success = true;
        resObject.message = "Player has been removed";
        return res.json(resObject);

    } catch (err) {
        console.error(err.message);
    }
});

//TournamentPlayers.js Component route: fetch all forbidden pairs for this tournament
app.get("/tournament/:id/fetch-forbidden-pairs", async (req, res) => {
    try {
        //returning object
        const resObject = {
            success: false,
            found: false,
            message: "",
            forbidden_pairs: null
        };


        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        //get the id from the URL and verify it is an integer
        const { id } = req.params;
        if (isNaN(id)) {
            resObject.message = "Invalid tournament ID";
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

    //catch any errors
    } catch (err) {
        console.error(err.message);
    }
});


//TournamentPlayers.js Component Route: add forbidden pair
app.put("/tournament/:id/add-forbidden-pair", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: ""
        };

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        };
        resObject.found = true;

        //get the id from the URL and verify it is an integer
        const { id } = req.params;
        if (isNaN(id)) {
            resObject.message = "Invalid tournament ID";
            return res.json(resObject);
        };

        //passed variables
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

        //check that pair already exists
        const existingPair = await pool.query(
            "SELECT * FROM forbidden WHERE tournament_id = $1 AND ((player_1_id = $2 AND player_2_id = $3) OR (player_1_id = $3 AND player_2_id = $2));",
            [id, player_1_id, player_2_id]
        );

        if (existingPair.rows.length > 0) {
            resObject.message = "Forbidden pair already exists";
            return res.json(resObject);
        };

        //add a forbidden pair
        const addForbiddenPair = await pool.query(
            "INSERT INTO forbidden (tournament_id, player_1_id, player_2_id) VALUES ($1, $2, $3);",
            [id, player_1_id, player_2_id]
        );

          
        resObject.success = true;
        resObject.message = "Forbidden pair has been added";
        return res.json(resObject);

    } catch (err) {
        console.error(err.message);
    }
});


//TournamentPlayers.js Component Route: remove forbidden pair
app.put("/tournament/:id/remove-forbidden-pair", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: ""
        };

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        //get the id from the URL and verify it is an integer
        const { id } = req.params;
        if (isNaN(id)) {
            resObject.message = "Invalid tournament ID";
            return res.json(resObject);
        };

        //passed variables
        const { pair_id } = req.body;
        if (!pair_id || isNaN(pair_id)) {
            resObject.message = "Invalid pair ID";
            return res.json(resObject);
        };

        //remove a forbidden pair
        const removeForbiddenPair = await pool.query(
            "DELETE FROM forbidden WHERE pair_id = $1;",
            [pair_id]
        );
          
        resObject.success = true;
        resObject.message = "Forbidden pair has been removed";
        return res.json(resObject);

    } catch (err) {
        console.error(err.message);
    }
});

//TournamentRounds.js Component Route: start tournament
app.put("/tournament/:id/start", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: ""
        };

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        //get the id from the URL and verify it is an integer
        const { id } = req.params;
        if (isNaN(id)) {
            resObject.message = "Invalid tournament ID";
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
        console.error(err.message);
    }
});

//TournamentRounds.js Component Route: fetch all rounds
app.get("/tournament/:id/fetch-rounds", async (req, res) => {
    try {
        //returning object
        const resObject = {
            success: false,
            found: false,
            message: "",
            rounds: null
        };

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        //get the id from the URL and verify it is an integer
        const { id } = req.params;
        if (isNaN(id)) {
            resObject.message = "Invalid tournament ID";
            return res.json(resObject);
        };

        //get the rounds
        const rounds = await pool.query(
            "SELECT * FROM rounds WHERE tournament_id = $1 ORDER BY round_number;",
            [id]
        );

        resObject.rounds = rounds.rows;
        resObject.success = true;
        resObject.message = "Rounds have been found";
        return res.json(resObject);

    } catch (err) {
        console.error(err.message);
    }
});

//TournamentRounds.js Component Route: fetch round pairings
app.get("/tournament/:id/fetch-round-pairings/:round_id", async (req, res) => {
    try {
        //returning object
        const resObject = {
            success: false,
            found: false,
            message: "",
            pairings: null
        };

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;


        //get the id from the URL and verify it is an integer
        const { id, round_id } = req.params;
        if (isNaN(id) || isNaN(round_id)) {
            resObject.message = "Invalid tournament ID or round ID";
            return res.json(resObject);
        };


        // Get cumulative points for all players
        const playerPoints = await getPlayerCumulativePoints(0.0, id, round_id);

        
        const result = await pool.query(`
                SELECT p.pairing_id, p.white_player_id, p.black_player_id, p.round_id, r.round_number, p.result,
                    wp.name AS white_player_name, wp.rating AS white_player_rating,
                    bp.name AS black_player_name, bp.rating AS black_player_rating
                FROM pairings p
                JOIN rounds r ON p.round_id = r.round_id
                JOIN players wp ON p.white_player_id = wp.player_id
                LEFT JOIN players bp ON p.black_player_id = bp.player_id
                WHERE p.round_id = $1 AND r.tournament_id = $2;`, 
            [round_id, id]);
        

        let pairingsList = [];

        result.rows.forEach(row => {
            pairingsList.push({
                pairing_id: row.pairing_id,
                white_player_id: row.white_player_id,
                white_player_name: row.white_player_name,
                white_player_rating: row.white_player_rating,
                white_player_points: playerPoints[row.white_player_id],
                black_player_id: row.black_player_id,
                black_player_name: row.black_player_name,
                black_player_rating: row.black_player_rating,
                black_player_points: playerPoints[row.black_player_id],
                result: row.result
            });
        });

        resObject.success = true; 
        resObject.message = "Pairings have been found";
        resObject.pairings = pairingsList;
        return res.json(resObject);

    } catch (err) {
        console.error(err.message);
    }
});

