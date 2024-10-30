// Import the Pool class from the pg module
const Pool = require("pg").Pool;

// Create a new instance with the database configuration
const pool = new Pool({
    user: "postgres",
    password: "kram600232",
    host: "localhost",
    port: 5432,
    database: "chess_manager_database"
})

// Export 
module.exports = pool;



