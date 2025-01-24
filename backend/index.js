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

setInterval(cleanUpSessions, 0.1 * 60 * 1000); // 6 seconds

//-----------------------------------------------------------------------

//ROUTES//

app.post("/login", async (req, res) => {
    //passed variables
    const { givenUsername, givenPassword } = req.body;

    //returning object
    const resObject = {
        found: false,
        message: "",
        session: null
    };

    //validation constraints, contents and range
    const usernameConstraints = /^[a-zA-Z0-9_]{1,35}$/;
    const passwordConstraints = /^[a-zA-Z0-9_]{1,40}$/;

    //check if empty or null
    if (!givenUsername || !givenPassword) {
        resObject.message = "Username and password cannot be null or empty";
        return res.json(resObject);
    }
            
    //check if username and password meet constraints
    if (!usernameConstraints.test(givenUsername) || (!passwordConstraints.test(givenPassword))) {
        resObject.message = "Invalid username or password";
        return res.json(resObject);
    }

    //sql query: looks for matches in the database after successful validation
    const user = await pool.query(
        "SELECT * FROM users WHERE username = $1 AND password = $2",
        [givenUsername, givenPassword]
    );

    //if a match is not found
    if (user.rows.length === 0) {
        resObject.message = "User has not been found or incorrect password";
        return res.json(resObject);
    } else {
        //if a match is found
        resObject.found = true;
        resObject.message = "User has been found";
        //create a sessionID
        const sessionID = `${givenUsername}-${Date.now()}`;
        //store the sessionID in the sessions object
        sessions[sessionID] = {userID: user.rows[0].user_id};
        //return the sessionID to the client
        resObject.session = sessionID;
        return res.json(resObject);
    }
})


//singup route
app.post("/signup", async (req, res) => {
    try {
        //passed variables
        const { firstName, surname, username, email, password } = req.body;
        
        //returning object
        const resObject = {
            success: false,
            message: ""
        };

        //validation constraints, contents and range
        const usernameConstraints = /^[a-zA-Z0-9_]{1,35}$/;
        const passwordConstraints = /^[a-zA-Z0-9_]{1,40}$/;
        const firstNameConstraints = /^[a-zA-Z]{1,20}$/;
        const surnameConstraints = /^[a-zA-Z]{1,20}$/;
        const emailConstraints = /^[a-zA-Z0-9_.@]{1,50}$/;


        //check if empty or null
        if (!firstName || !surname || !username || !email || !password) {
            resObject.message = "Data field cannot be left empty ";
            return res.json(resObject);
        }
                
        //check if meet constraints
        if (!usernameConstraints.test(username) || (!passwordConstraints.test(password)) || (!firstNameConstraints.test(firstName)) || (!surnameConstraints.test(surname)) || (!emailConstraints.test(email))) {
            resObject.message = "Invalid details: check that do not exceed range limit and use appropriate characters";
            return res.json(resObject);
        }

        //check if username alredy exist with sql query//
        const usernameCheck = await pool.query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        );

        if (usernameCheck.rows.length > 0) {
            resObject.message = "This username is already taken";
            return res.json(resObject);
        }
        // - //

        //check if email already exists with sql query//
        const emailCheck = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (emailCheck.rows.length > 0) {
            resObject.message = "Account with this email already exists";
            return res.json(resObject);
        }
        // - //

        //insert new user if previous checks are passed//
        const newUser = await pool.query(
            "INSERT INTO users (username, password, firstname, surname, email) VALUES ($1, $2, $3, $4, $5) ",
            [username, password, firstName, surname, email]
        );
        resObject.success = true;
        resObject.message = "Account has been created";
        return res.json(resObject);

    } catch (err) {
        console.error(err.message);
    }
})


//tournaments route
app.get("/tournaments", async (req, res) => {
    try {
        //returning object
        const resObject = {
            found: false,
            message: "",
            tournaments: null
        };

        //get the sessionID from the headers
        const sessionID = req.headers["session-id"];

        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }

        //get the userID from the session
        req.userID = sessions[sessionID].userID;

        //if user is authorised, get the tournaments
        const tournaments = await pool.query(
            "SELECT * FROM tournaments WHERE user_id = $1",
            [req.userID]
        );
        resObject.tournaments = tournaments.rows;
        resObject.found = true;
        resObject.message = "Tournaments have been found";
        return res.json(resObject);

    //catch any errors
    } catch (err) {
        console.error(err.message);
    }
})


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
    try{
        const sessionID = req.headers["session-id"];
        delete sessions[sessionID];
        return res.json({success: true, message: "Logged out"});
    } catch (err) {
        console.error(err.message);
        return res.json({success: false, message: "Server Error"});
    }  
});

app.put("/changePersonalDetails", async (req, res) => {
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

app.put("/changePassword", async (req, res) => {
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

app.delete("/deleteAccount", async (req, res) => {
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

app.put("/tournament/:id/updateDetails", async (req, res) => {
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

        //get the sessionID from the headers
        const sessionID = req.headers["session-id"];

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
        if ((!nameConstraints.test(name))) {
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
