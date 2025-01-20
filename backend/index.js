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





//singup route
app.post("/signup", async (req, res) => {
    try {
        //passed variables
        const { firstName, surname, username, email, password } = req.body;
        
        //check if username alredy exist with sql query//
        const usernameCheck = await pool.query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        );

        if (usernameCheck.rows.length > 0) {
            return res.json({ success: false, message: "Username is taken" });
        }
        // - //

        //check if email already exists with sql query//
        const emailCheck = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (emailCheck.rows.length > 0) {
            return res.json({ success: false, message: "Account on this email already exists" });
        }
        // - //

        //insert new user if previous checks are passed//
        const newUser = await pool.query(
            "INSERT INTO users (username, password, firstname, surname, email) VALUES ($1, $2, $3, $4, $5) ",
            [username, password, firstName, surname, email]
        );
        
        res.json({ success: true, message: "User Created"});

    } catch (err) {
        console.error(err.message);
    }
})


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
})


// Route to get tournament details by ID
app.put("/tournament/:id", async (req, res) => {
    try {
        //get the id from the URL
        const { id } = req.params;
        //get the username and password from the body
        const { givenUsername, givenPassword } = req.body;

        //validate and authorise the user
        const result_object = await checkAuthorised(givenUsername, givenPassword);

        //if user is not found for any reason
        if (!result_object.found) {
            return res.status(401).json({ found: false, message: "Unauthorised Access" });
        } else {
            //if user is authorised, get the tournament details
            const response = await pool.query(
                "SELECT * FROM tournaments WHERE tournament_id = $1",
                [id]
            );
            const tournament = response.rows[0];
            res.json({found: true, message: "", tournament_details: tournament});
        }

    //catch any errors
    } catch (err) {
        console.error(err.message);
    }
});


//test post request to check how json data type is received
/*
app.post("/test", async (req, res) => {
    try {
        const { nickname } = req.body;
        const user_score = await pool.query(
            "SELECT * FROM test WHERE nick = $1", 
            [nickname]      
        );
        res.json(user_score.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
})
*/



/*
//login route
app.post("/login", async (req, res) => {
    try {
        
        //passed variables
        const { username, password } = req.body;

        //sql query
        const user = await pool.query(
            "SELECT * FROM users WHERE username = $1 AND password = $2",
            [username, password]
        );

        //if username and password do not exist
        if (user.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid username or password", data: user.rows[0] });
        }
 
        //if exists
        res.json({ found: true, message: "Login Successful", user_data: user.rows[0]});

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
})
*/


/*
//login route
app.post("/login", async (req, res) => {
    try {
        //passed values
        const { givenUsername, givenPassword } = req.body;
        //validation constraints
        const usernameConstraints = /^[a-zA-Z0-9_]{1,35}$/;
        const passwordConstraints = /^[a-zA-Z0-9_]{1,40}$/;
        
        //check if empty or null
        if (!givenUsername || !givenPassword) {
            return res.status(400).json({ 
                found: false, 
                message: "Username and password cannot be null or empty",});
        }
        
        //check if username and password meet constraints
        if (!usernameConstraints.test(givenUsername) || (!passwordConstraints.test(givenPassword))) {
            return res.status(400).json({
                found: false, 
                message: "Invalid username or password"});
        }
        
        //sql query: looks for matches in the database
        const user = await pool.query(
            "SELECT * FROM users WHERE username = $1 AND password = $2",
            [givenUsername, givenPassword]
        );

        //if a match is not found
        if (user.rows.length === 0) {
            return res.status(401).json({ found: false, message: "User has not been found"});
        } else {
            //if a match is found
            res.json({ found: true, message: "Login Successful", user_id: user.rows[0].user_id });
        }
    
    //catch any errors
    } catch (err) {
        console.error(err.message);
    }
})
*/


/*
//authorise route
app.post("/authorise", async (req, res) => {
    try {
        //passed values from body
        const {givenUsername, givenPassword} = req.body;
        console.log("Server:", givenUsername, givenPassword);
        //validate and authorise the user
        const result_object = await checkAuthorised(givenUsername, givenPassword);

        console.log("Server result:", result_object.found);
        //if user is not found for any reason
        if (!result_object.found) {
            return res.status(401).json({ found: false, message: "Unauthorised Access" });
        } else {
            return res.json({ found: true, message: "Authorised Access" });
        }

    //catch any errors
    } catch (err) {
        console.error(err.message);
    }
})
*/