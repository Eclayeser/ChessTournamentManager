
const Pool = require("pg").Pool;
const pool = new Pool({
    user: "postgres",
    password: "kram600232",
    host: "localhost",
    port: 5432,
    database: "chess_manager_database"
})