// Import the Pool class from the pg module
const Pool = require("pg").Pool;

// Create a new instance with the database configuration
const pool = new Pool({
    user: "postgres",                  // User
    password: "kram600232",            // My password
    host: "localhost",                 // Default host for PostgreSQL
    port: 5432,                        // Default port for PostgreSQL
    database: "chess_manager_database" // Name of the database
})

// Export the pool instance 
module.exports = pool;



