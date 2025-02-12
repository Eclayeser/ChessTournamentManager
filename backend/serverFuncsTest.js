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

        return playerPoints;
    } catch (error) {
        console.error(error);
    };
};

async function getStandings(id){

    try {
        //FORM and SORT STANDINGS
        const playersData = await pool.query(`
            SELECT entries.player_id, players.name, players.rating
            FROM entries
            JOIN players ON entries.player_id = players.player_id
            WHERE entries.tournament_id = $1;
            `, [id]);

        let standings = playersData.rows;

        //get last round details
        const lastRoundDetails = await pool.query(`
            SELECT *
            FROM rounds
            WHERE tournament_id = $1
            ORDER BY round_number DESC
            LIMIT 1;
            `, [id]);

        //if empty, nor ounds were created yet
        if (lastRoundDetails.rows.length === 0) {
            for (let i = 0; i < standings.length; i++){
                standings[i]["player_points"] = 0;
                standings[i]["rounds_result"] = [];
                standings[i]["tiebreak_points"] = 0;
            };
      
        } else {
            const lastRoundNumber = lastRoundDetails.rows[0].round_number;

            //get tournament status
            const tournamentStatus = await pool.query(`
                SELECT status
                FROM tournaments
                WHERE tournament_id = $1;
                `, [id]);
            const status = tournamentStatus.rows[0].status;

            //decide which round number to consider
            const considerRoundNumber = status === "finished" ? lastRoundNumber+1 : lastRoundNumber;

            //get cumulative point (tournamentID, lastRoundNumber or lastRoundNumber + 1 (if status is 'finished'))
            const playerPoints = await getPlayersCumulativePoints(id, considerRoundNumber);

            //build a list of objects to be sorted [{ player_id: 12, player_name: "Player 1", player_rating: 1200, points: 5, rounds_result: ["L", "L", "W", "W", "L"], tiebreak_points: 22 }, ...]
            for (let i = 0; i < standings.length; i++){
                standings[i]["player_points"] = playerPoints[standings[i].player_id];

                let results = [];
                const resultsData = await pool.query(`
                    SELECT r.round_number, p.result, p.white_player_id, p.black_player_id,
                        CASE 
                            WHEN (p.white_player_id = $1 AND p.result = '1-0') OR 
                                (p.black_player_id = $1 AND p.result = '0-1') THEN 'W'
                            WHEN (p.white_player_id = $1 AND p.result = '0-1') OR 
                                (p.black_player_id = $1 AND p.result = '1-0') THEN 'L'
                            WHEN p.result = '1/2-1/2' THEN 'D'
                            WHEN p.result = 'bye' THEN 'B'
                            ELSE 'U'
                        END AS outcome
                    FROM pairings p
                    JOIN rounds r ON p.round_id = r.round_id
                    WHERE (p.white_player_id = $1 OR p.black_player_id = $1)
                    AND r.tournament_id = $2 AND r.round_number < $3
                    ORDER BY r.round_number ASC;`, 
                    [standings[i].player_id, id, considerRoundNumber]);


                //build a list of results
                resultsData.rows.forEach(({ outcome }) => {
                    results.push(outcome);
                });

                //for knockout, cocat a list of "-" to match legth of rounds
                if (results.length < considerRoundNumber - 1){
                    const diff = (considerRoundNumber - 1) - results.length;
                    for (let j = 0; j < diff; j++){
                        results.push("-");
                    };
                };

                standings[i]["rounds_result"] = results;


                ///////////////////////TIE BREAKS////////////////////////
                let type = "Sonneborn-Berger";

                let tiebreakPts = 0;

                if (type === "Buchholz Total", type === "Buchholz Cut 1" || type === "Buchholz Cut Median"){
                    let buchholz = [];

                    for ( let i = 0; i < resultsData.rows.length; i++){
                        const row = resultsData.rows[i];
                        if (row.outcome === "W"){
                            const playersPts = await getPlayersCumulativePoints(id, row.round_number);

                            if (row.result === '1-0'){
                                buchholz.push(playersPts[row.black_player_id] || 0);

                            } else if (row.result === '0-1'){
                                buchholz.push(playersPts[row.white_player_id] || 0);   
                            }
                        }
                    };
                    //remove zeroes
                    buchholz = buchholz.filter(x => x !== 0);
                    //sort in descending order
                    buchholz.sort((a, b) => b - a);

                    if (type === "buchholz Cut 1"){
                        //cut 1
                        buchholz = buchholz.slice(0, -1);
                    };

                    if (type === "buchholz Cut Median"){
                        //first and last
                        buchholz = buchholz.slice(1, -1);
                    };

                    //add up all points
                    buchholz = buchholz.reduce((a, b) => a + b, 0);

                    //assign to tiebreakPts
                    tiebreakPts = buchholz;

                } else if (type === "Sonneborn-Berger"){
                    let sonneborn = 0;

                    for ( let i = 0; i < resultsData.rows.length; i++){
                        const row = resultsData.rows[i];
                        if (row.outcome === "W"){
                            //last round points
                            const playersPts = await getPlayersCumulativePoints(id, considerRoundNumber);

                            if (row.result === '1-0'){
                                sonneborn += playersPts[row.black_player_id] || 0;

                            } else if (row.result === '0-1'){
                                sonneborn += playersPts[row.white_player_id] || 0;

                            } else if (row.result === '1/2-1/2'){

                                //if draw, add half of the points
                                if (row.white_player_id === standings[i].player_id){
                                    sonneborn += playersPts[row.black_player_id] / 2 || 0;
                                } else {
                                    sonneborn += playersPts[row.white_player_id] / 2 || 0;
                                };
                            };
                        }
                    };

                    //assign to tiebreakPts
                    tiebreakPts = sonneborn;
                };

                //default tiebreak points for testing
                standings[i]["tiebreak_points"] = tiebreakPts;
            };


            //sort standings by player_points, tiebreak_points, player_rating
            //priority -> higher points, higher tiebreak points, lower rating
            standings.sort((a, b) => {
                if (a.player_points === b.player_points) {

                    if (a.tiebreak_points === b.tiebreak_points) {
                        return a.rating - b.rating;
                    } else {
                        return b.tiebreak_points - a.tiebreak_points;
                    }

                } else {
                    return b.player_points - a.player_points;
                };
            });
        };

        return standings;

    } catch (err) {
        console.log(err);
    };
};

// Example usage
(async () => {
    console.log(await getStandings(23));
    
})();