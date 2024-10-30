const express = require("express");
const cors = require("cors");
const app = express();
const pool = require("./database")


//midleware
app.use(cors());
app.use(express.json());
app.listen(5000, () => {
    console.log("server has started on port 5000")
});

//ROUTES//

//login

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if username exists
        const user = await pool.query(
            "SELECT * FROM users WHERE username = $1 AND password = $2",
            [username, password]
        );

        if (user.rows.length === 0) {
            // No match found; credentials are incorrect
            return res.status(401).json({ success: false, message: "Invalid username or password", data: user.rows[0] });
        }

        
        // If there are matches, return success
        const userData = user.rows[0];
        res.json({ success: true, message: "Login Successful", user_data: userData});
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
})





