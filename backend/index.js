const express = require("express");
const cors = require("cors");
const app = express();
const pool = require("./database")

//ROUTES//

//create new user

//app.post("/newUser", async (req, res) => {
//    try {
//        const {describtion}
//    } catch (error) {
        
//    }
//})

//midleware
app.use(cors());
app.use(express.json());
app.listen(5000, () => {
    console.log("server has started on port 5000")
});