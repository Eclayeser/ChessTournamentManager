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


//ROUTES//

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
        res.json({ success: true, message: "Login Successful", user_data: user.rows[0]});

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: "Server error" });
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


//tournaments route  ---- to be finished
app.get("/tournaments", async (req, res) => {
    try {
        const { user_id } = req.body;
        const tournaments = await pool.query(
            "SELECT * ",
            [username, password, firstName, surname, email]
        );
        
        res.json({ success: true, message: "User Created"});

    } catch (err) {
        console.error(err.message);
    }
})






