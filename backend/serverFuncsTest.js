// import pool
const pool = require("./database");

//Function: form a list of player ids with their total points
async function getPlayersCumulativePoints(tournamentId, roundNumber) {
    try {
        //get tournament bye value
        const byeValue = await pool.query(
            "SELECT bye_value FROM tournaments WHERE tournament_id = $1",
            [tournamentId]
        );

        const result = await pool.query(`
                SELECT 
                    p.white_player_id AS player_id,
                    CASE 
                        WHEN p.result = '1-0' THEN 1.0 
                        WHEN p.result = '1/2-1/2' THEN 0.5 
                        WHEN p.result = 'bye' THEN $1
                        ELSE 0.0 
                    END AS points
                FROM pairings p
                JOIN rounds r ON p.round_id = r.round_id
                WHERE r.tournament_id = $2 AND r.round_number < $3

                UNION ALL

                SELECT 
                    p.black_player_id AS player_id,
                CASE 
                    WHEN p.result = '0-1' THEN 1.0 
                    WHEN p.result = '1/2-1/2' THEN 0.5
                    ELSE 0.0 
                END AS points
                FROM pairings p
                JOIN rounds r ON p.round_id = r.round_id
                WHERE r.tournament_id = $2 AND r.round_number < $3 AND p.black_player_id iS NOT NULL;`,
            [byeValue.rows[0].bye_value, tournamentId, roundNumber]);

        const playerPoints = {};

        result.rows.forEach(({ player_id, points }) => {
        if (!playerPoints[player_id]) {
            playerPoints[player_id] = 0.0;
        }
        playerPoints[player_id] += parseFloat(points);
        });

        console.log(playerPoints);
        return playerPoints;
    } catch (error) {
        console.error(error);
    };
};

//TournamentRounds.js Component Route: fetch round pairings
async function getRoundPairings(id, round_id) {
    //returning object
    const resObject = { success: false, found: false, message: "", pairings: null, round_number: null };

    try {
    
        const roundDetails = await pool.query("SELECT round_number FROM rounds WHERE round_id = $1;", [round_id]);

        // Get cumulative points for all players
        const playerPoints = await getPlayersCumulativePoints(id, roundDetails.rows[0].round_number);

        const result = await pool.query(`
                SELECT p.pairing_id, p.white_player_id, p.black_player_id, p.round_id, r.round_number, p.result,
                    wp.name AS white_player_name, wp.rating AS white_player_rating,
                    bp.name AS black_player_name, bp.rating AS black_player_rating
                FROM pairings p
                JOIN rounds r ON p.round_id = r.round_id
                JOIN players wp ON p.white_player_id = wp.player_id
                LEFT JOIN players bp ON p.black_player_id = bp.player_id
                WHERE p.round_id = $1 AND r.tournament_id = $2;`, 
            [round_id, id]);
        

        let pairingsList = [];

        result.rows.forEach(row => {
            pairingsList.push({
                pairing_id: row.pairing_id,
                white_player_id: row.white_player_id,
                white_player_name: row.white_player_name,
                white_player_rating: row.white_player_rating,
                white_player_points: playerPoints[row.white_player_id],
                black_player_id: row.black_player_id,
                black_player_name: row.black_player_name,
                black_player_rating: row.black_player_rating,
                black_player_points: playerPoints[row.black_player_id],
                result: row.result
            });
        });
        console.log(pairingsList);

        //sort pairingsList by sum of player points (bye value exception)
        pairingsList.sort((a, b) => {
            // Compute cumulative points sum for each pairing
            const sumA = (a.white_player_points || 0) + (a.black_player_points || 0);
            const sumB = (b.white_player_points || 0) + (b.black_player_points || 0);
        
            // Check if either pairing has a bye
            const aHasBye = a.black_player_id === null || a.white_player_id === null;
            const bHasBye = b.black_player_id === null || b.white_player_id === null;
        
            // If one pairing has a bye and the other doesn't, move the one with a bye to the end
            if (aHasBye && !bHasBye) return 1;
            if (!aHasBye && bHasBye) return -1;
        
            // Otherwise, sort by the sum of cumulative points in descending order
            return sumB - sumA;
        });
        console.log(pairingsList);

        resObject.success = true; 
        resObject.message = "Pairings have been found";
        resObject.pairings = pairingsList;
        resObject.round_number = roundDetails.rows[0].round_number;
        return resObject;


    //log error and return message "Server Error"
    } catch (err) {
        console.error(err);
        resObject.message = "Server Error";
        return resObject;
    }
};
 

// Example usage
(async () => {
    console.log(await getRoundPairings(16, 52));
    
})();