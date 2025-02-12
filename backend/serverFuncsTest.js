// import pool
const pool = require("./database");

/*
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
*/

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

        return playerPoints;
    } catch (error) {
        console.error(error);
    };
};


//swiss system sort

async function getPlayersSwiss(tournamentID){

    try {
        //get type
        const tournamentDetails = await pool.query(`SELECT type FROM tournaments WHERE tournament_id = $1`, [tournamentID]);

        if (tournamentDetails.rows[0].type === "Swiss System") {

            //get last round
            const lastRoundDetails = await pool.query("SELECT * FROM rounds WHERE tournament_id = $1 ORDER BY round_number DESC LIMIT 1", [tournamentID]);

            //get not-eliminated players
            const waitingPlayers = await pool.query(`
                SELECT entries.player_id, players.rating
                FROM entries
                JOIN players ON entries.player_id = players.player_id
                WHERE entries.tournament_id = $1 and entries.eliminated = false;`
            , [tournamentID]);

            let waitingPlayers_list = waitingPlayers.rows;

            ///////////// sort by rating, if no rounds were created //////////////////////
            if (lastRoundDetails.rows.length === 0){
    
                waitingPlayers_list.sort((a, b) => {
                    return b.rating - a.rating;
                });

                let ids = [];
                for (let i = 0; i < waitingPlayers_list.length; i++){
                    ids.push(waitingPlayers_list[i].player_id);
                };

                return ids;
            };

            ////////////////////// sort by rating, points, and byes //////////////////////////

            //////prepare data in form: [{ player_id: 13, rating: 1212, points: 0, bye: true }, ... ]//////

            //get cumulative scores
            const playersPts = await getPlayersCumulativePoints(tournamentID, lastRoundDetails.rows[0].round_number + 1);
            
            //form an obhect {'id': boolean}, where id is a player id and boolean value represents if the player has had a bye last round
            const resultsData = await pool.query(`
                SELECT white_player_id, result
                FROM pairings
                WHERE round_id = $1;`,
                [lastRoundDetails.rows[0].round_id]);

            let playersResults = {};

            for (let k = 0; k < resultsData.rows.length; k++){
                playersResults[resultsData.rows[k].white_player_id] = resultsData.rows[k].result;
            };

            //temporary (for test only)
            playersResults['13'] = 'bye';
            playersResults['15'] = 'bye';
            playersResults['18'] = 'bye';
            playersResults['14'] = '1-0';

            let playerANDresultsArray = waitingPlayers_list;

            for (let i = 0; i < playerANDresultsArray.length; i++){
                //add points to each object
                playerANDresultsArray[i]['points'] = playersPts[playerANDresultsArray[i].player_id];

                //set booleans indicating bye results
                if (playersResults[playerANDresultsArray[i].player_id] !== undefined){

                    if (playersResults[playerANDresultsArray[i].player_id] === 'bye'){
                        playerANDresultsArray[i]['bye'] = true;
                    } else {
                        playerANDresultsArray[i]['bye'] = false;
                    }

                } else {
                    playerANDresultsArray[i]['bye'] = false;
                };
                
            };



            ////////////////// sort; priority descend: points -> bye -> rating///////////////////

            playerANDresultsArray.sort((a, b) =>{
                
                if (a.points === b.points){

                    //sort by bye
                    if (a.bye && !b.bye) return -1 ;
                    if (!a.bye && b.bye) return 1 ;

                    //sort by rating
                    return b.rating - a.rating ;
                    
                //sort by points
                } else {
                    return b.points - a.points;
                };

            });

            
            let ids = [];
            for (let i = 0; i < playerANDresultsArray.length; i++){
                ids.push(playerANDresultsArray[i].player_id);
            };

            return ids;

        } else {
            return {funcSuccess: false, funcMessage: "Not a swiss system tournament"};
        };

    } catch (err) {
        console.log(err)
        return {funcSuccess: false, funcMessage: "Server Error"}
    };
};

// Example usage
(async () => {
    console.log(await getPlayersSwiss(23));
    
})();