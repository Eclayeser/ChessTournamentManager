
/*//TournamentRounds.js Component Route: create new round
app.post("/tournament/:id/create-round", async (req, res) => {
    try {
        //returning object
        const resObject = {
            success: false,
            found: false,
            message: "",
            round_id: null
        };

        //verify that the request is authorised
        const sessionID = req.headers["session-id"];
        if (!sessionID || !sessions[sessionID]) {
            resObject.message = "Session has expired";
            return res.status(401).json(resObject);
        }
        resObject.found = true;


        //get the id from the URL and verify it is an integer
        const { id } = req.params;
        if (isNaN(id)) {
            resObject.message = "Invalid tournament ID";
            return res.json(resObject);
        };

        ////////////////////get some essential tournament details for type distinquishing and round number, verify doesn;t break maximum/////////////////////////////////////////////
        const generatingDetails = await pool.query(`
            SELECT tournaments.type, tournaments.max_rounds, MAX(rounds.round_number)
            FROM tournaments
            JOIN rounds
            ON tournaments.tournament_id = rounds.tournament_id
            WHERE rounds.tournament_id = $1 GROUP BY tournaments.type, tournaments.max_rounds;
            `,
            [id])
        
        //get type
        const tournamentType = generatingDetails.rows[0].type
        //get round number
        const currentRound = generatingDetails.rows[0].max
        console.log("Current Round Number: ", currentRound);
        //verify round number is not equal or greater than max_rounds (not supposed to happen only if front-end modified)
        if (currentRound >= generatingDetails.rows[0].max_rounds){
            resObject.message = "Maximum number of rounds reached";
            return res.json(resObject); 
        };

        console.log("GeneratingTournament Details fetched")

        ////////////////////manage the results and eliminated statuses////////////////////////////////////////////////////////////////

        //passed values (results)
        const { result_object } = req.body; //{"id": "result", ...}

        //validate results to be only 1-0, 0-1, 1/2-1/2
        results = Object.values(result_object)

                    //eliminate_players = []  // [ {"id": id1, }] // if drawn, do not eliminate

        for (const single_result of results){
            if (single_result !== "1-0" && single_result !== "0-1" && single_result !== "1/2-1/2" ) {
                resObject.message = "Provide all the results before generating new round";
                return res.json(resObject); 
            };

            //for Knockout
            //if (tournamentType === "Knockout"){
                //construct a list of eliminated players
            //};
        };
        console.log("Results validation passed")

                    //for Knockout
                    // set eliminated of the players to true according to the eliminate_players list


        //set new results in the database, tracing all result object items (do a test)
        const caseStatements = [];
        const pairingsIds = [];
        const values = [];

        const results_array = Object.entries(result_object);

        results_array.forEach(([pairing_id, result], index) => {
            caseStatements.push(`WHEN pairing_id = $${index * 2 + 1} THEN $${index * 2 + 2}`);
            pairingsIds.push(`$${index * 2 + 1}`);
            values.push(pairing_id, result);
        });

        console.log(caseStatements, pairingsIds, values)

        const update_results_query = `
            UPDATE pairings 
            SET result = CASE
                ${caseStatements.join(' ')}
                ELSE result
            END
            WHERE pairing_id IN (${pairingsIds.join(', ')});
        `;

        const setResults = await pool.query(update_results_query, values);
        console.log("Results set")


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
});
*/

list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
console.log(list[list.length-1])