//test

// import pool
const pool = require("./database");

//Function: validate and update results //return {funcSuccess: success, funcMessage: message}
async function updateAllResults(resultsArray, tournamentID, type){
    let error = null
    let message = "";
    let success = null;

    //authoris////////////
    //validate
    if (isNaN(id)) {
        resObject.message = "Invalid user id";
        return resObject;
    };

    try {
        //form a list of corresponding pairing ids to given user id
        `
        SELECT tournaments.type, tournaments.max_rounds, COUNT(rounds.round_id)
                    FROM tournaments
                    JOIN rounds
                    ON tournaments.tournament_id = rounds.tournament_id
                    WHERE rounds.tournament_id = $1 GROUP BY tournaments.type, tournaments.max_rounds;
                    `

    } catch (err) {
        //catch errors
    }

    //compare pairings requested to the list; continue if each matches the one in the list



    //Validate
    resultsArray.forEach(([pairing_id, result]) => {
        if (isNaN(pairing_id) || (result !== "1-0" && result !== "0-1" && result !== "1/2-1/2" && result !== "-")){
            console.log("entered");
            message = "Invalid result details";
            success = false;
            error = true;
        };
    });
    if (error === true){
        return {funcSuccess: success, funcMessage: message};
    };


    //prepare query statement
    let cases_list = []
    let ids_list = []
    resultsArray.forEach(([pairing_id, result]) => {
            cases_list.push(`WHEN pairing_id = ${pairing_id} THEN '${result}'`);
            ids_list.push(pairing_id); 
        });

    const update_results_query = `
        UPDATE pairings 
        SET result = CASE
            ${cases_list.join(' ')}
            ELSE result
        END
        WHERE pairing_id IN (${ids_list.join(', ')});
    `;

    //////////////////////////////// manage elimination ///////////////////////

    //sent request
    try {
        const setResults = await pool.query(update_results_query);

    } catch(err) {
        console.error("Database update failed:", err);
        message = err.message
        success = false;
        return {funcSuccess: success, funcMessage: message}
    };

    //check that the round does not have any unplayed games
    const check_unplayed_query = `
        SELECT * FROM pairings
        WHERE round_id = (
            SELECT round_id 
            FROM rounds 
            WHERE tournament_id = $1
            ORDER BY round_number DESC
            LIMIT 1
        )
        AND result = '-';
    `;

    try {
        const checkUnplayed = await pool.query(check_unplayed_query, [tournamentID]);
        if (checkUnplayed.rows.length > 0){
            message = "Unable to finish: last round has unplayed games";
            success = false;
            return {funcSuccess: success, funcMessage: message}
        };

    } catch(err) {
        console.error("Database check failed:", err);
        message = err.message
        success = false;
        return {funcSuccess: success, funcMessage: message}
    };

    
    success = true;
    return {funcSuccess: success, funcMessage: message}
};


async function genNewRound (results_object, id) {

    //returning object
    const resObject = {
        success: false,
        message: "",
        round_id: null
    };

/////////get some essential tournament details for type distinquishing and round number, verify doesn't break maximum/////////

    //required variables to be fetched

    let tournamentType = null;
    let tournamentMaxRounds = null;
    let currentRoundNumber = null;

    //fetch general details: type, max_rounds
    try {
        
        const fetchTournDetails = await pool.query(`
            SELECT type, max_rounds
            FROM tournaments
            WHERE tournament_id = $1;
            `,
            [id])

        //get type
        tournamentType = fetchTournDetails.rows[0].type;

        //get max rounds
        tournamentMaxRounds = fetchTournDetails.rows[0].max_rounds;
        

    } catch (err) {
        resObject.message = "Error fetching tournament details";
        console.error("Error fetching tournament details", err);
        return resObject;
    }

    //fetch last round number by counting
    try {
        const fetchNumRounds = await pool.query(`
            SELECT COUNT(round_id)
            FROM rounds
            WHERE rounds.tournament_id = $1;
            `,
            [id])

        
        currentRoundNumber = fetchNumRounds.rows[0].count;

        //verify that it will not exceed the limit
        if (currentRoundNumber >= tournamentMaxRounds){
            resObject.message = "Maximum number of rounds reached";
            return resObject; 
        };
        


    } catch (err) {
        resObject.message = "Error fetching rounds";
        console.error("Error fetching rounds", err);
        return resObject;
    };
        

    ////////////////////manage the results, eliminate status (if Knockout), except new round is first round//////////////////////////////

    if (currentRoundNumber !== 0){
        //passed values (results_object)
            //in index.js

        const results_array = Object.entries(results_object);

        const operationReturn = await updateAllResults(results_array, id);
        console.log(operationReturn);
            if (operationReturn.funcSuccess === false){
                resObject.message = operationReturn.funcMessage;
                return res.json(resObject);
            }; 
    };

    //UPDATE PREVIOUS FUNCTION BEFORE CONTINUING
       

/*
        /////////////////////////////acquire essentials details before generating new pairings///////////////////////////////////////////

        //generate list of players, their opponents and colour they played
        let list_of_waiting_players = await getNElimPlayers(id); // [ id1, id2, id3, ...]
        const colours_data = await getPlayersColorCounts(id); // { id1: { white:2, black:3 }, ...}
        const opponents_data = await getPlayersOpponents(id); // { id1: [id2, id3], ...}
        console.log("Essential data fetched: ", list_of_waiting_players, colours_data, opponents_data)

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

        console.log("Pre-prepared data fetched: ", predPairsList, forbPairsList)

        /////////////////////////////////insert into rounds: with next round number, tournament id; return round id///////////////////////////////////
        const nextRoundNumber = currentRound + 1;
        console.log("Next Round Number: ", nextRoundNumber);

        const newRound = await pool.query(`
            INSERT INTO rounds (tournament_id, round_number)
            VALUES ($1, $2)
            RETURNING round_id;
            `,
            [id, nextRoundNumber]);
        const newRoundId = newRound.rows[0].round_id
        console.log("New Round ID: ", newRoundId)
        
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
    return resObject;
};




// Example usage
(async () => {
    const tournamentId = 19;
    const results = {'11': "1-0", '12': "1/2-1/2"}
    operation = await genNewRound(results, tournamentId);
    console.log(operation);
})();