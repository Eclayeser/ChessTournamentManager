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

//create new user

app.post("/newUser", async (req, res) => {
    try {
        const { username } = req.body;
        const newUser = await pool.query(
            "INSERT INTO users (username) VALUES($1) RETURNING *",
            [username]
        );
        res.json(newUser[0]);
    } catch (err) {
        console.error(err.message);
    }
})

