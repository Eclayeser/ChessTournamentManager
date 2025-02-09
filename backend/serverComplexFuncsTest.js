//test

// import pool
const pool = require("./database");

//Function: validate and update results of last round //return {funcSuccess: success, funcMessage: message}
async function updateLastRoundResults(resultsArray, tournamentID) {
    //variables
    let error = null
    let message = "";
    let success = null;  

    try {
        //validate resultsArray
        resultsArray.forEach(([pairing_id, result]) => {
            if (isNaN(pairing_id) || (result !== "1-0" && result !== "0-1" && result !== "1/2-1/2")){
                message = "Invalid result details";
                if (result === "-"){
                    message = "Result cannot be left empty";
                };
                success = false;
                error = true;
            };
        });
        if (error === true){
            return {funcSuccess: success, funcMessage: message};
        };


        //form a list of corresponding pairing ids (of last round, exluding byes) to given user id
        const lastPairings = await pool.query(`
            SELECT pairings.pairing_id
            FROM pairings
            JOIN rounds ON pairings.round_id = rounds.round_id
            WHERE rounds.tournament_id = $1
            AND rounds.round_number = (
                SELECT MAX(r.round_number)
                FROM rounds r
                WHERE r.tournament_id = $1
            )
            AND pairings.result != 'bye';`, 
            [tournamentID]);
        
        const requiredPairingIds = lastPairings.rows.map(row => row.pairing_id);

        //prepare query statement
        let cases_list = []
        let ids_list = []
        resultsArray.forEach(([pairing_id, result]) => {
                cases_list.push(`WHEN pairing_id = ${pairing_id} THEN '${result}'`);
                ids_list.push(pairing_id); 
            });

        //verify if all pairings id present (ensures no unexpected pairings are edited and all required pairings are edited)
        if ([...requiredPairingIds].sort((a, b) => a - b).toString() !== [...ids_list].sort((a, b) => a - b).toString()) {
            return {funcSuccess: false, funcMessage: "Invalid pairing id(s) detected"};
        }

        const update_results_query = `
            UPDATE pairings 
            SET result = CASE
                ${cases_list.join(' ')}
                ELSE result
            END
            WHERE pairing_id IN (${ids_list.join(', ')});`;

        //sent request to update results
        const setResults = await pool.query(update_results_query);
        return {funcSuccess: true, funcMessage: "Results updated successfully"};

    } catch (err) {
        console.error(err);
        return {funcSuccess: false, funcMessage: "An error occured"};
    };

};

//Functiion: construct a list of objects that contain the player_id and the count of the number of times it has played white and black separately
async function getPlayersColorCounts(tournamentId) {
    try {
      const result = await pool.query(`
            SELECT 
                p.white_player_id AS player_id, 
                COUNT(p.white_player_id) AS white_count, 
                0 AS black_count
            FROM pairings p
            JOIN rounds r ON p.round_id = r.round_id
            WHERE r.tournament_id = $1 AND p.black_player_id IS NOT NULL
            GROUP BY p.white_player_id
        
            UNION ALL
        
            SELECT 
                p.black_player_id AS player_id, 
                0 AS white_count, 
                COUNT(p.black_player_id) AS black_count
            FROM pairings p
            JOIN rounds r ON p.round_id = r.round_id
            WHERE r.tournament_id = $1 AND p.black_player_id IS NOT NULL
            GROUP BY p.black_player_id;`,
        [tournamentId]);

      const playerCounts = {};
  
      result.rows.forEach(({ player_id, white_count, black_count }) => {
        if (!playerCounts[player_id]) {
          playerCounts[player_id] = { white: 0, black: 0 };
        };
        playerCounts[player_id].white += parseInt(white_count, 10);
        playerCounts[player_id].black += parseInt(black_count, 10);
      });
  
      return playerCounts;

    } catch (error) {
      console.error(error);
    };
};
  

//Function: form a list of not eliminated players in the tournament
async function getNElimPlayers(tournamentId) {
    try {
        const players = await pool.query(`
            SELECT players.player_id
            FROM players 
            JOIN entries ON players.player_id = entries.player_id
            WHERE entries.tournament_id = $1 AND entries.eliminated = false`,
        [tournamentId]);

        const list = players.rows.map(player => player.player_id);
        return list;

    } catch (error) {
        console.error(error);
    };
};


//Function: form a list of objects to show what opponents has each player faced
async function getPlayersOpponents(tournamentId) {
    try {
        const result = await pool.query(`
            SELECT 
                p.white_player_id AS player_id, 
                p.black_player_id AS opponent_id
            FROM pairings p
            JOIN rounds r ON p.round_id = r.round_id
            WHERE r.tournament_id = $1 AND p.black_player_id IS NOT NULL
            
            UNION ALL
            
            SELECT 
                p.black_player_id AS player_id, 
                p.white_player_id AS opponent_id
            FROM pairings p
            JOIN rounds r ON p.round_id = r.round_id
            WHERE r.tournament_id = $1 AND p.black_player_id IS NOT NULL;`, 
        [tournamentId]);

        const playerOpponents = {};

        result.rows.forEach(({ player_id, opponent_id }) => {
        if (!playerOpponents[player_id]) {
            playerOpponents[player_id] = [];
        }
        playerOpponents[player_id].push(opponent_id);
        });

        return playerOpponents;

    } catch (error) {
        console.error(error);
    }
};

async function genNewRound (results_object, id) {
    //returning object
    const resObject = { success: false, message: "", round_id: null };

    try {
        //get userid and get tournament id, authorise

        /////////get some essential tournament details for type distinquishing and round number, verify doesn't break maximum/////////
        //fetch general details: type, max_rounds
        const fetchTournDetails = await pool.query(`
            SELECT type, max_rounds
            FROM tournaments
            WHERE tournament_id = $1;
            `,
            [id])

        
        const tournamentType = fetchTournDetails.rows[0].type;
        const tournamentMaxRounds = fetchTournDetails.rows[0].max_rounds;
        

        const fetchNumRounds = await pool.query(`
            SELECT COUNT(round_id)
            FROM rounds
            WHERE rounds.tournament_id = $1;
            `,
            [id])

        
        const currentRoundNumber = fetchNumRounds.rows[0].count;

        //verify that it will not exceed the limit
        if (currentRoundNumber >= tournamentMaxRounds){
            resObject.message = "Maximum number of rounds reached";
            return resObject; 
        };
        
        

        ////////////////////manage the results, eliminate status (if Knockout), except new round is first round///////////////////

        if (currentRoundNumber !== 0){
            //passed values (results_object) //in index.js
                
            const results_array = Object.entries(results_object);

            const operationReturn = await updateLastRoundResults(results_array, id);
            if (operationReturn.funcSuccess === false){
                resObject.message = operationReturn.funcMessage;
                return resObject;
            }; 
        };

        /////////////////////////////acquire essentials details before generating new pairings///////////////////////////////////////////

        //generate list of players, their opponents and colour they played
        let list_of_waiting_players = await getNElimPlayers(id); // [ id1, id2, id3, ...]
        const colours_data = await getPlayersColorCounts(id); // { id1: { white:2, black:3 }, ...}
        const opponents_data = await getPlayersOpponents(id); // { id1: [id2, id3], ...}

        //get the predefined pairs
        const predefinedPairsRequested = await pool.query(
            `SELECT predefined.white_player_id, predefined.black_player_id
            FROM predefined
            JOIN players p1 ON predefined.white_player_id = p1.player_id
            JOIN players p2 ON predefined.black_player_id = p2.player_id
            WHERE predefined.tournament_id = $1;`,
            [id]
        );
        const predPairsList = predefinedPairsRequested.rows; // [ { white_player_id: id1, black_player_id: id2 }, ...]

        //get the forbidden pairs
        const forbiddenPairsRequested = await pool.query(
            `SELECT forbidden.player_1_id, forbidden.player_2_id
            FROM forbidden
            JOIN players p1 ON forbidden.player_1_id = p1.player_id
            JOIN players p2 ON forbidden.player_2_id = p2.player_id
            WHERE forbidden.tournament_id = $1;`,
            [id]
        );
        const forbPairsList = forbiddenPairsRequested.rows; // [ { player_1_id: id1, player_2_id: id2 }, ...]

        /////////////////////////////////insert into rounds: with next round number, tournament id; return round id///////////////////////////////////
        const nextRoundNumber = parseInt(currentRoundNumber) + 1;

        //create new round
        const newRound = await pool.query(`
            INSERT INTO rounds (tournament_id, round_number)
            VALUES ($1, $2)
            RETURNING round_id;
            `,
            [id, nextRoundNumber]);

        const newRoundId = newRound.rows[0].round_id

        //////////////////////////////generate new round accordingly to the tournament type/////////////////////////////////////////////////////
        let pairings = [];
        let bye_players = [];
    
        // Apply predefined pairings
        for (let i = 0; i < predPairsList.length; i++) {
            let pair = predPairsList[i];
            if (list_of_waiting_players.includes(pair.white_player_id) && list_of_waiting_players.includes(pair.black_player_id)) {
                // Add predefined pair to the list of pairings
                pairings.push([pair.white_player_id, pair.black_player_id]);
                // Remove players from the waiting list
                list_of_waiting_players = list_of_waiting_players.filter(id => id !== pair.white_player_id && id !== pair.black_player_id);
            }
        };


        while (list_of_waiting_players.length > 0) {
            let player = list_of_waiting_players[0];
            let opponent = null;

            for (let j = 1; j < list_of_waiting_players.length; j++) {
                let potentialOpponent = list_of_waiting_players[j];

                // boolean value indicating whether the two players have already played against each other
                let alreadyPlayed = opponents_data[player] && opponents_data[player].includes(potentialOpponent);
                // boolean value indicating whether the two players are forbidden to play against each other
                let isForbidden = forbPairsList.some(fp => (fp.player_1_id === player && fp.player_2_id === potentialOpponent) ||
                                                            (fp.player_2_id === player && fp.player_1_id === potentialOpponent));

                // If the two players have not played against each other and are not forbidden to play against each other, exit the loop
                if (!alreadyPlayed && !isForbidden) {
                    opponent = potentialOpponent;
                    break;
                }
            }

            // If opponent was found, decide the colours; otherwise, set a bye pairing for the player
            if (opponent) {
                colourDifferencePlayer = colours_data[player].white - colours_data[player].black;
                colourDifferenceOpponent = colours_data[opponent].white - colours_data[opponent].black;

                //compare modulus difference of white and black games played by the players
                if (Math.abs(colourDifferencePlayer) >= Math.abs(colourDifferenceOpponent)){

                    //player's difference is more significant
                    if (colourDifferencePlayer >= 0){
                        pairings.push([player, opponent]);
                    } else {
                        pairings.push([opponent, player]);
                    };

                } else if (Math.abs(colourDifferencePlayer) < Math.abs(colourDifferenceOpponent)){

                    //opponent's difference is more significant
                    if (colourDifferenceOpponent >= 0){
                        pairings.push([opponent, player]);
                    } else {
                        pairings.push([player, opponent]);
                    };
                };

                
                list_of_waiting_players = list_of_waiting_players.filter(id => id !== player && id !== opponent);

            
            } else {
                bye_players.push(player);
                list_of_waiting_players = list_of_waiting_players.filter(id => id !== player);
            };

        };

        // Insert normal pairings into the database
        for (let k = 0; k < pairings.length; k++) {
            let [white, black] = pairings[k];
            await pool.query(`INSERT INTO pairings (round_id, white_player_id, black_player_id, result) VALUES ($1, $2, $3, '-');`, [newRoundId, white, black]);
        };

        // Insert bye pairings into the database
        for (let l = 0; l < bye_players.length; l++) {
            let player = bye_players[l];
            await pool.query(`INSERT INTO pairings (round_id, white_player_id, black_player_id, result) VALUES ($1, $2, NULL, 'bye');`, [newRoundId, player]);
        };

        resObject.message = "Results updated successfully";
        resObject.success = true;
        return resObject;

    } catch (err) {
        console.error(err);
    }
};




// Example usage
(async () => {
    const tournamentId = 16;
    const results = {'11': "1-0", '12': "1/2-1/2"}
    operation = await genNewRound(results, tournamentId);
    console.log(operation);
})();

    //UPDATE PREVIOUS FUNCTION BEFORE CONTINUING
       

/*
        

        
        
        ////////////////////////////////////generate new round accordingly to the tournament type/////////////////////////////////////////////////////

        let formedPairing = [] //[{round_id: *num*, white_player_id: *num*, black_player_id: *num*, result: ""}, ...]

        //add predefined pairs to the formedPairing and remove from waiting list
        predPairsList.forEach(pair => {
            formedPairing.push({
                round_id: newRoundId,
                white_player_id: pair.white_player_id,
                black_player_id: pair.black_player_id,
                result: ""
            });
            list_of_waiting_players = list_of_waiting_players.filter(player => player !== pair.white_player_id && player !== pair.black_player_id);
        });

        //generate formedPairings using: list_of_waiting_players, colours_data, opponents_data, predPairsList, forbPairsList
        while (list_of_waiting_players.length > 1){
            let currentPlayer = list_of_waiting_players.shift(); // take first player from the list, remove it from the list

            let matchFormed = false;
            let matchFound = false;
            
            iteration = 0; //to be used as index
            let considerOpponent = 0;

            console.log("waiting players: ", list_of_waiting_players);
            while (!matchFormed && !matchFound && iteration < list_of_waiting_players.length){
                //set the opponent to consider
                considerOpponent = list_of_waiting_players[iteration];
                console.log("Consider Opponent: ", considerOpponent)

                //check if player is in forbidden pair
                if (forbPairsList.some(pair => 
                    (pair.player_1_id === currentPlayer && pair.player_2_id === considerOpponent) ||
                    (pair.player_1_id === considerOpponent && pair.player_2_id === currentPlayer)))
                    {

                    //set a bye pairing if the opponet is the last in the list and cannot be paired with currentPlayer
                    if (iteration === list_of_waiting_players.length-1){
                        formedPairing.push({
                            round_id: newRoundId,
                            white_player_id: currentPlayer,
                            black_player_id: null,
                            result: "bye"
                        });
                        matchFormed = true;
                        continue;

                    //restart the loop with new index  
                    } else {
                        iteration++;
                        continue;
                    };
                };
                
                console.log("Not in forbidden pair")


                //check if player has already played with the opponent
                if (opponents_data[currentPlayer].includes(considerOpponent)){

                    //set a bye pairing if the opponet is the last in the list and cannot be paired with currentPlayer
                    if (iteration === list_of_waiting_players.length-1){
                        formedPairing.push({
                            round_id: newRoundId,
                            white_player_id: currentPlayer,
                            black_player_id: null,
                            result: "bye"
                        });
                        matchFormed = true;
                        continue;

                    //restart the loop with new index  
                    } else {
                        iteration++;
                        continue;
                    };

                };
                console.log("Not played yet")

                //set match found if considerOpponent has not played with currentPlayer and is not in forbidden pair
                matchFound = true;
            };

            console.log("Match found: ", matchFound)

            //if match found, compare the number of white and black games played by the players to decide appropriate colour
            if (!matchFormed && matchFound){
                colourDifferenceCurrentPlayer = colours_data[currentPlayer].white - colours_data[currentPlayer].black;
                colourDifferenceConsiderOpponent = colours_data[considerOpponent].white - colours_data[considerOpponent].black;

                //compare modulus difference of white and black games played by the players
                if (Math.abs(colourDifferenceCurrentPlayer) > Math.abs(colourDifferenceConsiderOpponent)){
                    
                    //if currentPlayer has played more white games, considerOpponent plays white
                    if (colourDifferenceCurrentPlayer > 0){
                        formedPairing.push({
                            round_id: newRoundId,
                            white_player_id: considerOpponent,
                            black_player_id: currentPlayer,
                            result: ""
                        });
                    };
                    //if currentPlayer has played more black games, currentPlayer plays white
                    if (colourDifferenceCurrentPlayer < 0){
                        formedPairing.push({
                            round_id: newRoundId,
                            white_player_id: currentPlayer,
                            black_player_id: considerOpponent,
                            result: ""
                        });
                    };

                } else {

                    //if considerOpponent has played more white games, considerOpponent plays white
                    if (colourDifferenceConsiderOpponent > 0){
                        formedPairing.push({
                            round_id: newRoundId,
                            white_player_id: considerOpponent,
                            black_player_id: currentPlayer,
                            result: ""
                        });
                    };
                    //if considerOpponent has played more black games, currentPlayer plays white
                    if (colourDifferenceConsiderOpponent < 0){
                        formedPairing.push({
                            round_id: newRoundId,
                            white_player_id: currentPlayer,
                            black_player_id: considerOpponent,
                            result: ""
                        });
                    };
                };

                list_of_waiting_players = list_of_waiting_players.filter(player => player !== considerOpponent);
            };

            console.log("Pairing formed: ", formedPairing)

        };

        //if one player left in the waiting list -> set a bye pairing
        if (list_of_waiting_players.length === 1){
            formedPairing.push({
                round_id: newRoundId,
                white_player_id: list_of_waiting_players[0],
                black_player_id: null,
                result: "bye"
            });
        };

        console.log("Pairings formed last: ", formedPairing)


        ///////////////////////prepare the data about generated pairings and insert it into the database///////////////////////////////////

        //form query
        function stringnifyDataGroups(value, index, array){
            if (index === array.length-1){
                grouped_insert_strData += `(${value.round_id}, ${value.white_player_id}, ${value.black_player_id}, ${value.result})`
            } else {
                grouped_insert_strData += `(${value.round_id}, ${value.white_player_id}, ${value.black_player_id}, ${value.result}), `
            };
        };

        let grouped_insert_strData = "";
        formedPairing.forEach(stringnifyDataGroups);

        console.log(grouped_insert_strData);

        new_pairings_query = `
            INSERT INTO pairings (round_id, white_player_id, black_player_id, result)
            VALUES ${grouped_insert_strData}
        `;

        //insert into pairings: multiple pairings: with new round id, white and black player id, result "-" OR "bye"
        const createNewPairings = await pool.query(new_pairings_query)

        resObject.success = true; 
        resObject.message = "Results updated and new pairings created successfully"

        return res.json(resObject);

    } catch (err) {
        console.error(err.message);
    };
    */
   



/*

`
SELECT tournaments.type, tournaments.max_rounds, COUNT(rounds.round_id)
FROM tournaments
JOIN rounds
ON tournaments.tournament_id = rounds.tournament_id
WHERE rounds.tournament_id = $1 GROUP BY tournaments.type, tournaments.max_rounds;
`
*/