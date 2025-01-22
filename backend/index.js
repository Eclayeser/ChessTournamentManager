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
        resObject.message = "User has NOT been found";
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
        console.log(tournament);
        return res.json({success: true, message: "Details retrieved", details: tournament});
        

    //catch any errors
    } catch (err) {
        console.error(err.message);
    }
});



/*
//check if the access is authorised, function to be used multiple times accross the routes
async function checkAuthorised(username, password) {
    //returning object
    const response_object = {
        found: false,
        message: "",
        user: null
    };

    //validation constraints, contents and range
    const usernameConstraints = /^[a-zA-Z0-9_]{1,35}$/;
    const passwordConstraints = /^[a-zA-Z0-9_]{1,40}$/;

    //check if empty or null
    if (!username || !password) {
        response_object.message = "Username and password cannot be null or empty";
        return response_object;
    }
            
    //check if username and password meet constraints
    if (!usernameConstraints.test(username) || (!passwordConstraints.test(password))) {
        response_object.message = "Invalid username or password";
        return response_object;
    }

    //sql query: looks for matches in the database after successful validation
    const user = await pool.query(
        "SELECT * FROM users WHERE username = $1 AND password = $2",
        [username, password]
    );

    //if a match is not found
    if (user.rows.length === 0) {
        response_object.message = "User has NOT been found";
        return response_object;
    } else {
        //if a match is found
        response_object.found = true;
        response_object.message = "User has been found";
        response_object.user = user.rows[0];
        return response_object;
    }
}


//ROUTES//

//login route
app.post("/login", async (req, res) => {
    try {
        //passed values from body
        const {givenUsername, givenPassword} = req.body;

        //validate and authorise the user
        const result_object = await checkAuthorised(givenUsername, givenPassword);

        //if user is not found for any reason
        if (!result_object.found) {
            return res.status(401).json(result_object);
        } else {
            res.json(result_object);
        }

    //catch any errors
    } catch (err) {
        console.error(err.message);
    }
})
*/


/*

//tournaments route
app.post("/tournaments", async (req, res) => {
    try {
        //passed values from body
        const { givenUsername, givenPassword } = req.body;

        //validate and authorise the user
        const result_object = await checkAuthorised(givenUsername, givenPassword);

        //if user is not found for any reason
        if (!result_object.found) {
            return res.status(401).json({ found: false, message: "Unauthorised Access" });
        } else {
            //if user is authorised, get the tournaments
            const tournaments = await pool.query(
                "SELECT * FROM tournaments WHERE user_id = $1",
                [result_object.user.user_id]
            );
            res.json({ found: true, message: "", tournaments: tournaments.rows });
        }

    //catch any errors
    } catch (err) {
        console.error(err.message);
    }
})*/