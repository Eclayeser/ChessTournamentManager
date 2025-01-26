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
const emailConstraints = /^[a-zA-Z0-9\-.@+]{1,50}$/;

//tournaments: name, type, tie_break, num_rounds, max_players, hide_rating
const tournamentNameConstraints = /^[a-zA-Z_0-9\- ]{1,50}$/;


//players: name, rating, club, email, add_points
const playerNameConstraints = /^[a-zA-Z\- ]{1,50}$/;
const clubConstraints = /^[a-zA-Z0-9\- ]{1,50}$/;
const playerEmailConstraints = /^[a-zA-Z0-9_.@]{1,50}$/;


//ROUTES//

//Check Session Route
app.get("/check-session", async (req, res) => {
    //returning object
    const resObject = {
        found: false,
    };

    try {
        //get the sessionID from the headers
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

        //check if empty or null
        if (!givenUsername || !givenPassword) {
            resObject.message = "Fields cannot be left empty";
            return res.json(resObject);
        };
                
        //check if username and password meet constraints
        if (!usernameConstraints.test(givenUsername) || (!passwordConstraints.test(givenPassword))) {
            resObject.message = "Incorrect username or password";
            return res.json(resObject);
        };

        //sql query: looks for matches in the database
        const user = await pool.query(
            "SELECT * FROM users WHERE username = $1 AND password = $2",
            [givenUsername, givenPassword]
        );

        //if a match is not found
        if (user.rows.length === 0) {
            resObject.message = "User has not been found or incorrect password";
            return res.json(resObject);

        //otherwise
        } else {
            
            resObject.success = true;
            resObject.message = "User has been found";

            //create a sessionID, store in server-side object and return to client
            const sessionID = `${givenUsername}-${Date.now()}`;
            sessions[sessionID] = {userID: user.rows[0].user_id};
            resObject.session = sessionID;

            return res.json(resObject);
        };

    //catch any errors
    } catch (err) {
        console.error(err.message);
        resObject.message = "Server Error:";
        return res.json(resObject);
    };
});


//Singup.js Component Route
app.post("/signup", async (req, res) => {
    //returning object
    const resObject = {
        success: false,
        message: ""
    };

    try {
        //passed values
        const { firstName, surname, username, email, password } = req.body;
        
        //check if empty or null
        if (!firstName || !surname || !username || !email || !password) {
            resObject.message = "Fields cannot be left empty";
            return res.json(resObject);
        };
                
        //check if meet constraints
        if (!usernameConstraints.test(username) || (!passwordConstraints.test(password)) || (!firstNameConstraints.test(firstName)) || (!surnameConstraints.test(surname)) || (!emailConstraints.test(email))) {
            resObject.message = "Invalid details: check that do not exceed range limit and use appropriate characters";
            return res.json(resObject);
        };

        //sql query: check if username alredy exist with
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
            "INSERT INTO users (username, password, firstname, surname, email) VALUES ($1, $2, $3, $4, $5) ",
            [username, password, firstName, surname, email]
        );
        resObject.success = true;
        resObject.message = "Account has been created";
        return res.json(resObject);

    //catch any errors
    } catch (err) {
        console.error(err.message);
        resObject.message = "Server Error";
        return res.json(resObject);
    };
});


//Dashboard.js Component Route
app.get("/fetch-tournaments", async (req, res) => {
    //returning object
    const resObject = {
        success: false,
        found: false,
        message: "",
        tournaments: null
    };

    try {
        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        };
        resObject.found = true;
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
        resObject.message = "Server Error";
        res.json(resObject);
    };
});


// Route to get tournament details by ID
app.get("/tournament/:id/details", async (req, res) => {
    try {
        //returning object
        const resObject = {
            success: false,
            message: "",
            details: null
        };

        //get the id from the URL
        const { id } = req.params;

        //get the sessionID from the headers
        const sessionID = req.headers["session-id"];

        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }


        //if user is authorised, get the tournament details
        const response = await pool.query(
            "SELECT * FROM tournaments WHERE tournament_id = $1",
            [id]
        );
        const tournament = response.rows[0];

        return res.json({success: true, message: "Details retrieved", details: tournament});
        

    //catch any errors
    } catch (err) {
        console.error(err.message);
    }
});


app.get("/account", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            message: "",
            user: null
        };

        //get the sessionID from the headers
        const sessionID = req.headers["session-id"];
        console.log(sessionID);

        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }

        //get the userID from the session
        req.userID = sessions[sessionID].userID;

        //if user is authorised, get the user details
        const user = await pool.query(
            "SELECT * FROM users WHERE user_id = $1",
            [req.userID]
        );

        resObject.user = user.rows[0]
        resObject.found = true;
        resObject.message = "User details have been found";
        return res.json(resObject);

    //catch any errors
    }catch (err) {
        console.error(err.message);
    }
});

app.post("/logout", async (req, res) => {

    const resObject = {
        found: false,
        success: false,
        message: ""
    };
    try{
        const sessionID = req.headers["session-id"];

        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        delete sessions[sessionID];

        resObject.success = true;
        resObject.message = "Logged out";
        return res.json(resObject);



    } catch (err) {
        console.error(err.message);
    }  
});

app.put("/update-user-details", async (req, res) => {
    try {
        //passed variables
        const { email, surname, firstName } = req.body;

        //returning object
        const resObject = {
            found: false,
            success: false,
            message: ""
        };

        //get the sessionID from the headers
        const sessionID = req.headers["session-id"];

        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        //get the userID from the session
        req.userID = sessions[sessionID].userID;

        //validation constraints, contents and range
        const firstNameConstraints = /^[a-zA-Z]{1,20}$/;
        const surnameConstraints = /^[a-zA-Z]{1,20}$/;
        const emailConstraints = /^[a-zA-Z0-9_.@]{1,50}$/;

        //check if empty or null
        if (!email || !surname || !firstName) {
            resObject.message = "Data field cannot be left empty ";
            return res.json(resObject);
        }
                
        //check if meet constraints
        if ((!firstNameConstraints.test(firstName)) || (!surnameConstraints.test(surname)) || (!emailConstraints.test(email))) {
            resObject.message = "Invalid details: check that do not exceed range limit and use appropriate characters";
            return res.json(resObject);
        }

        //update user details
        const updatedUser = await pool.query(
            "UPDATE users SET email = $1, surname = $2, firstname = $3 WHERE user_id = $4",
            [email, surname, firstName, req.userID]
        );
        resObject.success = true;
        resObject.message = "Details have been updated";
        return res.json(resObject);

    } catch (err) {
        console.error(err.message);
    }
})

app.put("/update-password", async (req, res) => {
    try {
        //passed variables
        const { password, newPassword } = req.body;

        //returning object
        const resObject = {
            found: false,
            success: false,
            message: ""
        };

        //get the sessionID from the headers
        const sessionID = req.headers["session-id"];

        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        //get the userID from the session
        req.userID = sessions[sessionID].userID;

        //validation constraints, contents and range
        const passwordConstraints = /^[a-zA-Z0-9_]{1,40}$/;

        //check if empty or null
        if (!newPassword || !newPassword) {
            resObject.message = "Data field cannot be left empty";
            return res.json(resObject);
        }
                
        //check if meet constraints
        if ((!passwordConstraints.test(newPassword)) || (!passwordConstraints.test(password))) {
            resObject.message = "Invalid details: check that do not exceed range limit and use appropriate characters";
            return res.json(resObject);
        }

        //check if old password matches
        const user = await pool.query(
            "SELECT * FROM users WHERE user_id = $1 AND password = $2",
            [req.userID, password]
        );

        if (user.rows.length === 0) {
            resObject.message = "Old password is incorrect";
            return res.json(resObject);
        }

        //update user password
        const updatedUser = await pool.query(
            "UPDATE users SET password = $1 WHERE user_id = $2",
            [newPassword, req.userID]
        );
        resObject.success = true;
        resObject.message = "Password has been updated";
        return res.json(resObject);

    } catch (err) {
        console.error(err.message);
    }
});

app.delete("/delete-user", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: ""
        };

        //get the sessionID from the headers
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

app.put("/tournament/:id/update-details", async (req, res) => {
    try {

        //passed variables
        const { name, num_rounds, max_players, bye_value, hide_rating } = req.body;

        //returning object
        const resObject = {
            found: false,
            success: false,
            message: ""
        };

        //get the id from the URL
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


        //check if empty or null
        if (!name || !num_rounds || !max_players) {
            resObject.message = "Data field cannot be left empty ";
            return res.json(resObject);
        }

        //check if meet constraints
        if ( num_rounds < 1 || num_rounds > 50 || !Number.isInteger(num_rounds)) {
            resObject.message = "Number of rounds must be an integer between 1 and 50";
            return res.json(resObject);
        }
        if ( max_players < 1 || max_players > 1000 || !Number.isInteger(max_players)) {
            resObject.message = "Number of players must be an integer between 1 and 1000";
            return res.json(resObject);
        }
        if (  bye_value !== 0 && bye_value !== 0.5 && bye_value !== 1) {
            resObject.message = "Bye value can only take the values 0, 0.5 or 1";
            return res.json(resObject);
        }
        if ( hide_rating !== true && hide_rating !== false) {
            resObject.message = "Hide rating can only be true or false";
            return res.json(resObject);
        }
        if ((!tournamentNameConstraints.test(name))) {
            resObject.message = "Name exceeds range limit or contains inappropriate characters";
            return res.json(resObject);
        }


        //update tournament details
        const updatedTournament = await pool.query(
            "UPDATE tournaments SET name = $1, num_rounds = $2, max_players = $3, bye_value = $4, hide_rating = $5 WHERE tournament_id = $6",
            [name, num_rounds, max_players, bye_value, hide_rating, id]
        );
        resObject.success = true;
        resObject.message = "Details have been updated";
        return res.json(resObject);

    } catch (err) {
        console.error(err.message);
    }
});

app.delete("/tournament/:id/delete", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: ""
        };

        //get the id from the URL
        const { id } = req.params;

        //get the sessionID from the headers
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

    } catch (err) {
        console.error(err.message);
        resObject.message = "Server Error";
        return res.json(resObject);
    }
});

app.post("/tournament/create", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: "",
            tournament_id: null
        };

        //get the sessionID from the headers
        const sessionID = req.headers["session-id"];

        const { name, type, tie_break, num_rounds, max_players, hide_rating, bye_value } = req.body;
        console.log(name, type, tie_break, num_rounds, max_players, hide_rating, bye_value);

        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        //get the userID from the session
        req.userID = sessions[sessionID].userID;

        //validation constraints
        const nameConstraints = /^[a-zA-Z_0-9 ]{1,50}$/;
  
        //check if empty or null
        if (!name || !num_rounds || !max_players || !type || !tie_break) {
            resObject.message = "Data field cannot be left empty ";
            return res.json(resObject);
        }

        //check if meet constraints
        if ( num_rounds < 1 || num_rounds > 50 || !Number.isInteger(num_rounds)) {
            resObject.message = "Number of rounds must be an integer between 1 and 50";
            return res.json(resObject);
        }
        if ( max_players < 1 || max_players > 1000 || !Number.isInteger(max_players)) {
            resObject.message = "Number of players must be an integer between 1 and 1000";
            return res.json(resObject);
        }
        if (  bye_value !== 0 && bye_value !== 0.5 && bye_value !== 1) {
            resObject.message = "Bye value can only take the values 0, 0.5 or 1";
            return res.json(resObject);
        }
        if ( hide_rating !== true && hide_rating !== false) {
            resObject.message = "Hide rating can only be true or false";
            return res.json(resObject);
        }
        if ((!nameConstraints.test(name))) {
            resObject.message = "Name exceeds range limit or contains inappropriate characters";
            return res.json(resObject);
        }
        if (type !== "Round-robin" && type !== "Swiss System" && type !== "Knockout") {
            resObject.message = "Tournament type can only be of the available types";
            return res.json(resObject);
        }
        if (tie_break !== "Sonneborn-Berger" && tie_break !== "Buchholz Total" && tie_break !== "Buchholz Cut 1" && tie_break !== "Buchholz Cut Median") {
            resObject.message = "Tie break can only be of the available types";
            return res.json(resObject);
        }

        //insert new tournament
        const newTournament = await pool.query(
            "INSERT INTO tournaments (user_id, name, type, num_rounds, max_players, bye_value, tie_break, hide_rating, forbidden) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING tournament_id",
            [req.userID, name, type, num_rounds, max_players, bye_value, tie_break, hide_rating, null]
        );
        resObject.success = true;
        resObject.message = "Tournament has been created";
        resObject.tournament_id = newTournament.rows[0].tournament_id;
        return res.json(resObject);

    } catch (err) {
        console.error(err.message);
        resObject.message = "Server Error";
        return res.json(resObject);
    }
});

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

        //get the id from the URL
        const { id } = req.params;

        //get the sessionID from the headers
        const sessionID = req.headers["session-id"];

        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        //if user is authorised, get the players
        const players = await pool.query(
            "SELECT players.* FROM players JOIN entries ON players.player_id = entries.player_id WHERE entries.tournament_id = $1",
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

app.post("/tournament/:id/create-player", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: "",
            player: null
        };

        //get the id from the URL
        const { id } = req.params;

        //get the sessionID from the headers
        const sessionID = req.headers["session-id"];

        let { name, rating, club, email, add_points } = req.body;

        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        //get the userID from the session
        req.userID = sessions[sessionID].userID;

        //check if empty or null
        if (!name || !email) {
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
        if ((!playerEmailConstraints.test(email))) {
            resObject.message = "Email exceeds range limit or contains inappropriate characters";
            return res.json(resObject);
        }

        if (add_points < 0 || add_points > 1000 || add_points % 0.5 !== 0) {
            resObject.message = "Additional points must be a multiple of 0.5 between 0 and 1000";
            return res.json(resObject);
        }

        const existingPlayer = await pool.query(
            "SELECT * FROM players WHERE email = $1;",
            [email]
        );

        //check if player already exists with this email
        if (existingPlayer.rows.length > 0) {
            resObject.message = "Player with this email already exists in the database. Use 'Seach and Add' to add player to the tournament";
            return res.json(resObject);
        }
        //insert new player
        const newPlayer = await pool.query(
            "INSERT INTO players (name, rating, club, email, add_points) VALUES ($1, $2, $3, $4, $5) RETURNING players.*;",
            [name, rating, club, email, add_points]
        );

        //insert new entry
        const newEntry = await pool.query(
            "INSERT INTO entries (tournament_id, player_id, score, predefined, eliminated) VALUES ($1, $2, $3, $4, $5);",
            [id, newPlayer.rows[0].player_id, null, null, false]
        );

        resObject.player = newPlayer.rows[0];
        resObject.success = true;
        resObject.message = "Player has been added";
        return res.json(resObject);

    } catch (err) {
        console.error(err.message);
    }
});


app.post("/fetch-player-details", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: "",
            player: null
        };

        //get the sessionID from the headers
        const sessionID = req.headers["session-id"];

        const { player_id } = req.body;
        console.log(player_id);

        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;


        const player = await pool.query(
            "SELECT * FROM players WHERE player_id = $1;",
            [player_id]
        );

        resObject.player = player.rows[0];
        resObject.success = true;
        resObject.message = "Player details have been fetched";
        return res.json(resObject);

    } catch (err) {
        console.error(err.message);
    }
});

app.put("/edit-player-details", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: "",
            player: null
        };

        //get the sessionID from the headers
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

app.delete("/tournament/:id/remove-player", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: ""
        };

        //get the id from the URL
        const { id } = req.params;

        //get the sessionID from the headers
        const sessionID = req.headers["session-id"];

        const { player_id } = req.body;

        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;

        //check if empty or null, and if id is valid
        if (!player_id || !Number.isInteger(player_id)) {
            resObject.message = "Invalid player id";
            return res.json(resObject);
        }

        //check if player exists
        const findPlayer = await pool.query(
            "SELECT * FROM players WHERE player_id = $1;",
            [player_id]
        );

        if (findPlayer.rows.length === 0) {
            resObject.message = "Invalid player id";
            return res.json(resObject);
        };

        //delete player from the tournament
        const deleteEntry = await pool.query(
            "DELETE FROM entries WHERE player_id = $1 AND tournament_id = $2;",
            [player_id, id]
        );

        //delete forbidden pairs that contain this player
        const originalForbidden = await pool.query(
            "SELECT forbidden FROM tournaments WHERE tournament_id = $1",
            [id]
        );

        if (originalForbidden.rows[0] > 0) {
            const forbidden_pairs = originalForbidden.rows[0].forbidden;

            let flag = false;
            index = 0;
            while (index < forbidden_pairs.length) {
                if (forbidden_pairs[index][0] === player_id || forbidden_pairs[index][1] === player_id) {
                    forbidden_pairs.splice(index, 1);
                    index = 0;
                    flag = true;
                } else {
                    index++;
                };
            };

            if (flag) {
                const updatedForbidden = await pool.query(
                    "UPDATE tournaments SET forbidden = $1 WHERE tournament_id = $2",
                    [forbidden_pairs, id]
                );
            };
        };
        


        resObject.success = true;
        resObject.message = "Player has been removed";
        return res.json(resObject);

    } catch (err) {
        console.error(err.message);
    }
});

app.post("/tournament/:id/add-existing-player", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            success: false,
            message: ""
        };

        //get the id from the URL
        const { id } = req.params;

        //get the sessionID from the headers
        const sessionID = req.headers["session-id"];

        const { email } = req.body;

        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;


        //check if empty or null, and if email is valid
        if (!email || !playerEmailConstraints.test(email)) {
            resObject.message = "Invalid email";
            return res.json(resObject);
        }

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
            "INSERT INTO entries (tournament_id, player_id, score, predefined, eliminated) VALUES ($1, $2, $3, $4, $5);",
            [id, player_id, null, null, false]
        );

        resObject.success = true;
        resObject.message = "Player has been added";
        return res.json(resObject);

    } catch (err) {
        console.error(err.message);
    }
});

app.get("/tournament/:id/forbidden-pairs", async (req, res) => {
    try {
        //returning object
        const resObject = {
            success: false,
            found: false,
            message: "",
            forbidden: null
        };

        //get the id from the URL
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

        //get the id from the URL
        const { id } = req.params;

        

        const { pair_id } = req.body;

        //get the sessionID from the headers
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

        //get the id from the URL
        const { id } = req.params;

        const { player1_id, player2_id } = req.body;

        //get the sessionID from the headers
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

        //get the id from the URL
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

async function produceStandings(tournament_id) {
    try {
        // Retrieve player data
        const playersResult = await pool.query(
            `SELECT players.player_id, players.name, players.rating, players.add_points
            FROM players
            JOIN entries ON players.player_id = entries.player_id
            WHERE entries.tournament_id = $1`, 
            [tournament_id]
        );

        const players_data = playersResult.rows;
        
        //list of ids
        const players_ids = players_data.map(player => player.player_id);

        //find out number of rounds
        const resultFromScore = await pool.query(
            `SELECT score FROM entries WHERE tournament_id = $1 AND player_id = $2`,
            [tournament_id, players_ids[0]]
        );
        const score = resultFromScore.rows[0].score;

        console.log(score);
        let no_more_rounds = false
        let round_count = 1;
        while (!no_more_rounds) {
            try{
                index = `round${round_count}`;
                if (Number.isInteger(score.index.result)) {
                    round_count++;
                }
                console.log(index);

            } catch (err){
                no_more_rounds = true;
            };
        };

        
        console.log(round_count);

    } catch (err) {
        console.error(err.message);
    }
}

produceStandings(15);

        /* iterate through ids to fetch total points
        const total_points = [];
        for (const player_id of players_ids) {
            console.log(player_id);
            const pointsResult = await pool.query(
                `SELECT (COALESCE((score->'round1'->>'result')::float, 0) + COALESCE((score->'round2'->>'result')::float, 0)) AS total_points 
                FROM entries WHERE entry_id = 34;`,
                [player_id, tournament_id]
            );
            total_points.push(pointsResult.rows);
        }*/