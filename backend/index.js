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
    if (type !== "Round-robin" && type !== "Swiss System" && type !== "Knockout") {
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


//TournamentSettings.js Component Route: fetch tournament details (can be used in other components)
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
        const { name, type, tie_break, max_rounds, max_participants, hide_rating, bye_value } = req.body;

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        //get the userID from the session
        req.userID = sessions[sessionID].userID;
  
        //validate tournament details
        const validationResult = verifyTournamentDetails(name, type, tie_break, max_rounds, max_participants, hide_rating);
        if (!validationResult.valid) {
            resObject.message = validationResult.message;
            return res.json(resObject);
        };


        //insert new tournament
        const newTournament = await pool.query(
            `INSERT INTO tournaments 
            (user_id, name, type, max_rounds, max_participants, bye_value, tie_break, hide_rating)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING tournament_id`,
            [req.userID, name, type, max_rounds, max_participants, bye_value, tie_break, hide_rating]
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

        //passed variables
        const { name, max_rounds, max_participants, bye_value, hide_rating } = req.body;

        //get the id from the URL and verify it is an integer
        const { id } = req.params;

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        //get the userID from the session
        req.userID = sessions[sessionID].userID;


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
            "INSERT INTO players (name, rating, club, email) VALUES ($1, $2, $3, $4) RETURNING players.player_id;",
            [name, rating, club, email]
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

/*
app.put("/edit-player-details", async (req, res) => {
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

        let { player_id, name, rating, club, add_points } = req.body;

        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        //check if empty or null
        if (!name) {
            resObject.message = "Data field cannot be left empty ";
            return res.json(resObject);
        }
        if (!rating) {
            rating = 0;
        }
        if (!club) {
            club = "-";
        }
        if (!add_points) {
            add_points = 0;
        }

        //check if meet constraints
        if ( rating < 0 || rating > 4000 || !Number.isInteger(rating)) {
            resObject.message = "Rating must be an integer between 0 and 4000";
            return res.json(resObject);
        }
        if ((!playerNameConstraints.test(name))) {
            resObject.message = "Name exceeds range limit or contains inappropriate characters";
            return res.json(resObject);
        }
        if ((!clubConstraints.test(club))) {
            resObject.message = "Club exceeds range limit or contains inappropriate characters";
            return res.json(resObject);
        }
        if (add_points < 0 || add_points > 1000 || add_points % 0.5 !== 0) {
            resObject.message = "Additional points must be a multiple of 0.5 between 0 and 1000";
            return res.json(resObject);
        }

        //update player details
        const updatedPlayer = await pool.query(
            "UPDATE players SET name = $1, rating = $2, club = $3, add_points = $4 WHERE player_id = $5 RETURNING *;",
            [name, rating, club, add_points, player_id]
        );

        resObject.player = updatedPlayer.rows[0];
        resObject.success = true;
        resObject.message = "Player details have been updated";
        return res.json(resObject);
    } catch (err) {
        console.error(err.message);
    }
});
*/

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

        resObject.success = true;
        resObject.message = "Player has been removed";
        return res.json(resObject);

    } catch (err) {
        console.error(err.message);
    }
});


/*
app.get("/tournament/:id/forbidden-pairs", async (req, res) => {
    try {
        //returning object
        const resObject = {
            success: false,
            found: false,
            message: "",
            forbidden: null
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

        //if user is authorised, get the forbidden pairs
        const forbidden = await pool.query(
            "SELECT forbidden FROM tournaments WHERE tournament_id = $1",
            [id]
        );
        const forbidden_pairs_ids = forbidden.rows[0].forbidden;
        //console.log(forbidden_pairs_ids);
        
        
        const forbidden_pairs = [];

        for (const index in forbidden_pairs_ids) {
            const forbidden_player_1 = await pool.query(
                "SELECT name FROM players WHERE player_id = $1",
                [forbidden_pairs_ids[index][0]]
            );
            //console.log(forbidden_player_1);
            const forbidden_player_2 = await pool.query(
                "SELECT name FROM players WHERE player_id = $1",
                [forbidden_pairs_ids[index][1]]
            );
            //console.log(forbidden_player_2);
            forbidden_pairs.push({
                player1_name: forbidden_player_1.rows[0].name, 
                player2_name: forbidden_player_2.rows[0].name,
                player1_id: forbidden_pairs_ids[index][0],
                player2_id: forbidden_pairs_ids[index][1]
            });
        }

 
        resObject.forbidden_pairs = forbidden_pairs;
        resObject.success = true;
        resObject.message = "Forbidden pairs have been found";
        return res.json(resObject);

    //catch any errors
    } catch (err) {
        console.error(err.message);
    }
});

app.put("/tournament/:id/remove-forbidden-pair", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: ""
        };

        //get the id from the URL and verify it is an integer
        const { id } = req.params;

        

        const { pair_id } = req.body;

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        const originalForbidden = await pool.query(
            "SELECT forbidden FROM tournaments WHERE tournament_id = $1",
            [id]
        );
        const forbidden_pairs = originalForbidden.rows[0].forbidden;

        //check if the pair is valid
        if (pair_id < 0 || pair_id >= forbidden_pairs.length || !Number.isInteger(pair_id)) {
            resObject.message = "Invalid pair id";
            return res.json(resObject);
        }

        //remove the pair from the 2d array
        forbidden_pairs.splice(pair_id, 1);

        //update the forbidden pairs
        const updatedForbidden = await pool.query(
            "UPDATE tournaments SET forbidden = $1 WHERE tournament_id = $2",
            [forbidden_pairs, id]
        );
          
        resObject.success = true;
        resObject.message = "Forbidden pair has been removed";
        resObject.forbidden_pairs = forbidden_pairs;
        return res.json(resObject);

    } catch (err) {
        console.error(err.message);
    }
});

app.put("/tournament/:id/add-forbidden-pair", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: ""
        };

        //get the id from the URL and verify it is an integer
        const { id } = req.params;

        const { player1_id, player2_id } = req.body;

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        };
        resObject.found = true;

        //check if empty or null
        if (!player1_id || !player2_id) {
            resObject.message = "No ids given";
            return res.json(resObject);
        };

        //check if the players are the same
        if (player1_id === player2_id) {
            resObject.message = "Players cannot be the same";
            return res.json(resObject);
        };

        //check if the ids are integers
        if (!Number.isInteger(player1_id) || !Number.isInteger(player2_id)) {
            resObject.message = "IDs must be integers";
            return res.json(resObject);
        };

        //check if players exist
        const player1 = await pool.query(
            "SELECT * FROM players WHERE player_id = $1",
            [player1_id]
        );
        const player2 = await pool.query(
            "SELECT * FROM players WHERE player_id = $1",
            [player2_id]
        );

        if (player1.rows.length === 0 || player2.rows.length === 0) {
            resObject.message = "One or both players do not exist";
            return res.json(resObject);
        }

        //get the forbidden pairs
        const originalForbidden = await pool.query(
            "SELECT forbidden FROM tournaments WHERE tournament_id = $1",
            [id]
        );
        const forbidden_pairs = originalForbidden.rows[0].forbidden;

        //check if the pair already exists
        for (const index in forbidden_pairs) {
            if (forbidden_pairs[index][0] === player1_id && forbidden_pairs[index][1] === player2_id) {
                resObject.message = "Pair already exists";
                return res.json(resObject);
            }
            if (forbidden_pairs[index][0] === player2_id && forbidden_pairs[index][1] === player1_id) {
                resObject.message = "Pair already exists";
                return res.json(resObject);
            }
        }

        //add the pair to the 2d array
        forbidden_pairs.push([player1_id, player2_id]);

        //update the forbidden pairs
        const updatedForbidden = await pool.query(
            "UPDATE tournaments SET forbidden = $1 WHERE tournament_id = $2",
            [forbidden_pairs, id]
        );
          
        resObject.success = true;
        resObject.message = "Forbidden pair has been added";
        resObject.forbidden_pairs = forbidden_pairs;
        return res.json(resObject);

    } catch (err) {
        console.error(err.message);
    }
});

//TournamentStandings.js
app.get("/tournament/:id/standings", async (req, res) => {
    try {
        //returning object
        const resObject = {
            success: false,
            found: false,
            message: "",
            standings: null
            //standings: [{player_name: "John", player_rating: 1000, points: 3, rounds_result: ["W", "L"], tiebreak_points: 10}, ]
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

        console.log("here");

        //Produce standings

    //catch any errors
    } catch (err) {
        console.error(err.message);
    }
});

*/