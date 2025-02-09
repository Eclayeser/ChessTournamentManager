// import pool
const pool = require("./database");

function genNewPairings(){
    resObject = {success: false, message: "", round_id: null};

    let list_of_waiting_players = [ 13, 17, 15, 16, 14 ]
    const colours_data = {
        '13': { white: 3, black: 0 },
        '14': { white: 1, black: 1 },
        '15': { white: 1, black: 1 },
        '16': { white: 0, black: 3 },
        '17': { white: 1, black: 1 }
      }

    const opponents_data = {
        '13': [ 14, 15 ],
        '14': [ 17, 13 ],
        '15': [ 16, 13 ],
        '16': [ 15, 17 ],
        '17': [ 16, 14 ]
      }

    const predPairsList = [ { white_player_id: 14, black_player_id: 17 } ] 
    const forbPairsList = [ { player_1_id: 15, player_2_id: 13 } ]

    const newRoundId = 1;

    ///////////////////////////////////////

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

    console.log(pairings);
    console.log(bye_players);

    // Insert normal pairings into the database
    for (let k = 0; k < pairings.length; k++) {
        let [white, black] = pairings[k];
        console.log(`INSERT INTO pairings (round_id, white_player_id, black_player_id) VALUES (${newRoundId}, ${white}, ${black});`)
    };

    // Insert bye pairings into the database
    for (let l = 0; l < bye_players.length; l++) {
        let player = bye_players[l];
        console.log(`INSERT INTO pairings (round_id, white_player_id, black_player_id) VALUES (${newRoundId}, ${player}, NULL);`)
    };

    return resObject;

}


// Example usage
(async () => {
    console.log(await genNewPairings());
    
})();