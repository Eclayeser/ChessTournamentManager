//IMPORT SECTION
import React from 'react';
//...

//FUNCTIONAL COMPONENT
const UniqueComponentName = () => {
    //varaiables
    //...
    //server-requesting functions
    //...
    //Display contents
    return (
        {/*DISPLAY CONTENTS*/}
    );
};
//EXPORT COMPONENT
export default UniqueComponentName;



React


`
SELECT r.round_number, p.result, p.white_player_id, p.black_player_id,
    CASE 
        WHEN (p.white_player_id = 3 AND p.result = '1-0') OR 
            (p.black_player_id = 3 AND p.result = '0-1') THEN 'W'
        WHEN (p.white_player_id = 3 AND p.result = '0-1') OR 
            (p.black_player_id = 3 AND p.result = '1-0') THEN 'L'
        WHEN p.result = '1/2-1/2' THEN 'D'
        WHEN p.result = 'bye' THEN 'B'
        ELSE 'U'
    END AS outcome
FROM pairings p
JOIN rounds r ON p.round_id = r.round_id
WHERE (p.white_player_id = 3 OR p.black_player_id = 3)
AND r.tournament_id = 10 AND r.round_number < 5
ORDER BY r.round_number ASC;`