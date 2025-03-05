-- create database called chess_manager_database
CREATE DATABASE chess_manager_database;

-------------------------------------------------------------------------------------------------------------------------

--create entity <users>
CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,     --field for user ID, autoincrement, primary key
    username VARCHAR(35) NOT NULL,  --field for username, 35 characters max, not null
    password VARCHAR(40) NOT NULL,  --field for password, 40 characters max, not null
    firstname VARCHAR(20) NOT NULL, --field for firstname, 20 characters max, not null
    surname VARCHAR(20) NOT NULL,   --field for surname, 20 characters max, not null
    email VARCHAR(50) NOT NULL      --field for email, 50 characters max, not null
);


--insert a record into entity <users>
INSERT INTO users (username, password, firstname, surname, email)
VALUES ('user1', 'pass1', 'Nestr', 'Lobonov', 'nest@g.com');


--select all rows from entity <users>
SELECT * FROM users;

--update data under username column where user_id = 1
UPDATE users
SET username = NULL
WHERE user_id = 1;

--update data under firstname column where user_id = 1
UPDATE users
SET firstname = 'ThisNameIs21Character'
WHERE user_id = 1;
-------------------------------------------------------------------------------------------------------------------------

--create entity <tournaments>
CREATE TABLE tournaments(
    tournament_id SERIAL PRIMARY KEY,        --field for tournament ID, autoincrement, primary key
    user_id INT REFERENCES users(user_ID) NOT NULL ON DELETE CASCADE, 
    --field for user ID, foreign key, delete dependent records, not null
    name VARCHAR(50) NOT NULL,               --field for tournament name, 50 characters max, not null
    type TEXT NOT NULL,                      --field for tournament type, text, not null
    bye_value FLOAT NOT NULL,                --field for bye value, float, not null
    tie_break TEXT,                          --field for tie break type, text
    hide_rating BOOLEAN NOT NULL,            --field for hide rating instruction, boolean, not null
    status TEXT NOT NULL                     --field for tournament status, text, not null
);


--insert data into entity <tournaments>
INSERT INTO tournaments (user_id, name, type, bye_value, tie_break, hide_rating, status)
VALUES (1, 'Challenger', 'Swiss System', 1, 'Buchholz Cut 1', TRUE, 'initialised');

INSERT INTO tournaments (user_id, name, type, num_rounds, max_players, bye_value, tie_break, hide_rating)
VALUES (6, 'TestTournament_8', 'test_type', 7, 10, 1, 'test_tie_break', TRUE);
--Boundary Data: max_players (1000)

--updata data under hide_rating column where tournament_id = 1
UPDATE tournaments
SET hide_rating = 'Yess'
WHERE tournament_id = 1;

-------------------------------------------------------------------------------------------------------------------------

--create entity <players>
CREATE TABLE players(
    player_id SERIAL PRIMARY KEY,        --field for player ID, autoincrement, primary key
    name VARCHAR(50) NOT NULL,           --field for player's name, 50 characters max, not null
    rating SMALLINT CHECK (rating >= 0 AND rating <= 4000) NOT NULL, 
    --field for player's rating, integer, check is between 0 and 4000, not null
    email VARCHAR(50) NOT NULL,          --field for player's email, 50 characters max, not null
    club VARCHAR(50) NOT NULL,           --field for player's club, 50 characters max, not null
    created_by INT NOT NULL              --field for creator's ID, integer, not null
);

--i didn't make it foreign key specificly, so that the player still stays in the database if the creator was deleted, it just cannot ever be edited again
ALTER TABLE players
ADD COLUMN created_by INT NOT NULL;

--insert data into entity <players>
INSERT INTO players (name, rating, email, club, created_by)
VALUES ('Terra', 1000, 'qqz@k.com', 'Bishops', 1);

--Boundary Data: rating (4000)

--insert into rounds
INSERT INTO rounds (tournament_id, round_number)
VALUES (16, 1);

--Insert into pairings
INSERT INTO pairings (round_id, white_player_id, black_player_id, result)
VALUES (3, 14, null, '');



--select all rows from entity <players>
SELECT * FROM players;

--delete record from entity <tournaments> where tournament_id = 1
DELETE FROM tournaments
WHERE tournament_id = 1;

-------------------------------------------------------------------------------------------------------------------------

--create entity <entries>
CREATE TABLE entries(
    entry_id SERIAL PRIMARY KEY,            --field for entry ID, autoincrement, primary key
    tournament_id INT REFERENCES tournaments(tournament_ID) ON DELETE CASCADE NOT NULL, 
    --field for tournament ID, foreign key, delete dependent records, not null
    player_id INT REFERENCES players(player_ID) ON DELETE CASCADE NOT NULL, 
    --field for player ID, foreign key, delete dependent records, not null
    additional_points FLOAT CHECK (additional_points >= 0 AND additional_points <= 50) NOT NULL,
    --field for additional points, float, check is between 0 and 50, not null
    eliminated BOOLEAN NOT NULL             --field for eliminated status, boolean, not null
);

ALTER TABLE entries
ADD COLUMN additional_points FLOAT CHECK (additional_points >= 0 AND additional_points <= 50) NOT NULL;

--insert a record into entity <entries>
INSERT INTO entries (tournament_id, player_id, additional_points, eliminated)
VALUES (1, 3, 25, FALSE);

--updata data under additional_points column where entry_id = 1
UPDATE entries
SET additional_points = 50.5
WHERE entry_id = 1;


-------------------------------------------------------------------------------------------------------------------------

--create entity <rounds>
CREATE TABLE rounds(
    round_id SERIAL PRIMARY KEY,       --field for round ID, autoincrement, primary key
    tournament_id INT REFERENCES tournaments(tournament_ID) ON DELETE CASCADE NOT NULL, 
    --field for tournament ID, foreign key, delete dependent records, not null
    round_number INT NOT NULL          --field for round number, integer, not null
);


--insert data into entity <rounds>
INSERT INTO rounds (tournament_id, round_number)
VALUES (1, 1);


-------------------------------------------------------------------------------------------------------------------------


--create entity <pairings>
CREATE TABLE pairings(
    pairing_id SERIAL PRIMARY KEY,      --field for pairing ID, autoincrement, primary key
    round_id INT REFERENCES rounds(round_ID) ON DELETE CASCADE NOT NULL, 
    --field for round ID, foreign key, delete dependent records, not null
    white_player_id INT REFERENCES players(player_ID) ON DELETE CASCADE,
    --field for white player ID, foreign key, delete dependent records
    black_player_id INT REFERENCES players(player_ID) ON DELETE CASCADE,
    --field for black player ID, foreign key, delete dependent records
    result VARCHAR(10) NOT NULL         --field for result, 10 characters max, not null 
);



-------------------------------------------------------------------------------------------------------------------------


--create entity <forbidden>
CREATE TABLE forbidden(
    pair_id SERIAL PRIMARY KEY,        --field for pair ID, autoincrement, primary key
    player_1_id INT REFERENCES players(player_ID) ON DELETE CASCADE NOT NULL, 
    --field for 1st player ID, foreign key, delete dependent records, not null
    player_2_id INT REFERENCES players(player_ID) ON DELETE CASCADE NOT NULL,
    --field for 2nd player ID, foreign key, delete dependent records, not null
    tournament_id INT REFERENCES tournaments(tournament_ID) ON DELETE CASCADE NOT NULL
    --field for tournament ID, foreign key, delete dependent records, not null
);



-------------------------------------------------------------------------------------------------------------------------

--create entity <predefined>
CREATE TABLE predefined(
    pair_id SERIAL PRIMARY KEY,        --field for pair ID, autoincrement, primary key
    white_player_id INT REFERENCES players(player_ID) ON DELETE CASCADE NOT NULL,
    --field for white player ID, foreign key, delete dependent records, not null
    black_player_id INT REFERENCES players(player_ID) ON DELETE CASCADE NOT NULL,
    --field for black player ID, foreign key, delete dependent records, not null
    tournament_id INT REFERENCES tournaments(tournament_ID) ON DELETE CASCADE NOT NULL
    --field for tournament ID, foreign key, delete dependent records, not null
);


-------------------------------------------------------------------------------------------------------------------------

`SELECT players.player_id, players.name, players.rating, players.club, entries.additional_points, entries.eliminated
FROM players JOIN entries ON players.player_id = entries.player_id 
WHERE entries.tournament_id = $1`

SELECT players.player_id, players.name, players.rating, players.club, entries.additional_points, entries.eliminated
FROM players JOIN entries ON players.player_id = entries.player_id 
WHERE entries.tournament_id = 3


--joint selection from entities <tournaments>, <players> and <entries>
SELECT tournaments.name, players.name, players.rating, entries.score
FROM tournaments
--join entity <tournaments> with entity <entries> by tournament_id
JOIN entries ON tournaments.tournament_id = entries.tournament_id
--join entity <players> with entity <entries> by player_id
JOIN players ON entries.player_id = players.player_id;


CREATE TABLE predefined(
    pair_id SERIAL PRIMARY KEY,
    white_player_id INT REFERENCES players(player_ID) ON DELETE CASCADE NOT NULL,
    blak_player_id INT REFERENCES players(player_ID) ON DELETE CASCADE NOT NULL,
    tournament_id INT REFERENCES tournaments(tournament_ID) ON DELETE CASCADE NOT NULL
);


ALTER TABLE users
ADD COLUMN password VARCHAR(30) NOT NULL,
ADD COLUMN firstname VARCHAR(30) NOT NULL,
ADD COLUMN surname VARCHAR(30) NOT NULL;

ALTER TABLE predefined
DROP COLUMN blak_player_id,
DROP COLUMN tournament_id;

UP


ALTER TABLE tournaments
ADD COLUMN max_participants SMALLINT CHECK (max_participants > 0 AND max_participants <= 1000),
ADD COLUMN max_rounds SMALLINT CHECK (max_rounds > 0 AND max_rounds <= 1000);

ALTER TABLE predefined
ADD COLUMN black_player_id INT REFERENCES players(player_ID) ON DELETE CASCADE NOT NULL,
ADD COLUMN tournament_id INT REFERENCES tournaments(tournament_ID) ON DELETE CASCADE NOT NULL;

ALTER TABLE users
ADD COLUMN email VARCHAR(50) NOT NULL;

ALTER TABLE users
ALTER COLUMN username TYPE VARCHAR(50),
ALTER COLUMN password TYPE VARCHAR(50),
ALTER COLUMN firstname TYPE VARCHAR(50),
ALTER COLUMN surname TYPE VARCHAR(50);

INSERT INTO users (username, password, firstname, surname, email)
VALUES ('t', 'p', 'M', 'T', 'm@g.com');


num_rounds SMALLINT CHECK (num_rounds > 0 AND num_rounds <= 50) NOT NULL,
    --field for total number of rounds, integer, not null, check is between 1 and 50
    max_players SMALLINT CHECK (num_rounds > 0 AND num_rounds <= 1000) NOT NULL,


INSERT INTO tournaments (tournament_name, tournament_type, user_ID)
VALUES ('tournament_1', 'test_type', 8);
INSERT INTO tournaments (tournament_name, tournament_type, user_ID)
VALUES ('tournament_2', 'test_type', 8);
INSERT INTO tournaments (tournament_name, tournament_type, user_ID)
VALUES ('tournament_3', 'test_type', 8);

ALTER TABLE pairings
ADD COLUMN white_player_id INT REFERENCES players(player_ID) ON DELETE CASCADE,
ADD COLUMN black_player_id INT REFERENCES players(player_ID) ON DELETE CASCADE, 
ADD COLUMN result VARCHAR(10);

ALTER TABLE pairings
DROP COLUMN white_player_id,
DROP COLUMN black_player_id,
DROP COLUMN result;

ALTER TABLE tournaments DROP CONSTRAINT tournaments_user_id_fkey;

ALTER TABLE tournaments
ADD CONSTRAINT tournaments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

--alter table tournaments to add not null constraints to max_rounds and max_participants
ALTER TABLE tournaments
ALTER COLUMN max_rounds SET NOT NULL,
ALTER COLUMN max_participants SET NOT NULL;





CREATE TABLE test (
    general_ID SERIAL PRIMARY KEY,
    nick VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    number SMALLINT NOT NULL,
    data jsonb NOT NULL
);

INSERT INTO test (nick, password, number, data)
VALUES ('MMM', 'pass', 10000, '{"key": "value", "key2": [1, 2, 3]}');



SELECT (COALESCE((score->'round1'->>'result')::float, 0) + COALESCE((score->'round2'->>'result')::float, 0)) AS total_points FROM entries WHERE entry_id = 34;

SELECT 
p.white_player_id AS player_id, 
COUNT(p.white_player_id) AS white_count, 
0 AS black_count
FROM pairings p
JOIN rounds r ON p.round_id = r.round_id
WHERE r.tournament_id = 16 AND p.black_player_id IS NOT NULL
GROUP BY p.white_player_id

UNION ALL

SELECT 
p.black_player_id AS player_id, 
0 AS white_count, 
COUNT(p.black_player_id) AS black_count
FROM pairings p
JOIN rounds r ON p.round_id = r.round_id
WHERE r.tournament_id = 16 AND p.black_player_id IS NOT NULL
GROUP BY p.black_player_id;

-------
SELECT 
p.white_player_id AS player_id, 
p.black_player_id AS opponent_id
FROM pairings p
JOIN rounds r ON p.round_id = r.round_id
WHERE r.tournament_id = 16 AND p.black_player_id IS NOT NULL

UNION ALL

SELECT 
p.black_player_id AS player_id, 
p.white_player_id AS opponent_id
FROM pairings p
JOIN rounds r ON p.round_id = r.round_id
WHERE r.tournament_id = 16 AND p.black_player_id IS NOT NULL;


pairings = {{white_player_id: *num*, white_player_name: "", white_player_rating: *num*, white_player_points: *num*, black_player_id: *num*, black_player_name: "", black_player_rating: *num*, black_player_points: *num*, result: ""}, ...}


-------------------------------------------------------------------------------------------------------------------------

UPDATE pairings
SET result = 'bye'
WHERE pairing_id = 7 OR pairing_id = 10;

SELECT 
p.white_player_id AS player_id,
CASE 
WHEN p.result = '1-0' THEN 1.0 
WHEN p.result = '1/2-1/2' THEN 0.5 
WHEN p.result = 'bye' THEN 2.0
ELSE 0.0 
END AS points
FROM pairings p
JOIN rounds r ON p.round_id = r.round_id
WHERE r.tournament_id = 16 AND r.round_number < 3

UNION ALL

SELECT 
p.black_player_id AS player_id,
CASE 
WHEN p.result = '0-1' THEN 1.0 
WHEN p.result = '1/2-1/2' THEN 0.5
WHEN p.result = 'bye' THEN 2.0 
ELSE 0.0 
END AS points
FROM pairings p
JOIN rounds r ON p.round_id = r.round_id
WHERE r.tournament_id = 16 AND r.round_number < 3 AND p.black_player_id iS NOT NULL;




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
                    WHEN p.result = 'bye' THEN $1 
                    ELSE 0.0 
                END AS points
                FROM pairings p
                JOIN rounds r ON p.round_id = r.round_id
                


SELECT * FROM pairings
WHERE round_id = (
    SELECT round_id 
    FROM rounds 
    WHERE tournament_id = 16
    ORDER BY round_number DESC
    LIMIT 1
)
AND result = '-'


SELECT p.pairing_id, p.white_player_id, p.black_player_id, p.round_id, r.round_number, p.result,
                    wp.name AS white_player_name, wp.rating AS white_player_rating,
                    bp.name AS black_player_name, bp.rating AS black_player_rating
                FROM pairings p
                JOIN rounds r ON p.round_id = r.round_id
                JOIN players wp ON p.white_player_id = wp.player_id
                LEFT JOIN players bp ON p.black_player_id = bp.player_id
                WHERE p.round_id = 3 AND r.tournament_id = 1


--authorise pairings requests
SELECT pairings.pairing_id
            FROM pairings
            JOIN rounds ON pairings.round_id = rounds.round_id
            WHERE rounds.tournament_id = 16
            AND rounds.round_number = (
                SELECT MAX(r.round_number)
                FROM rounds r
                WHERE r.tournament_id = 16
            )
            AND pairings.result != 'bye';


update tournaments
set status = 'initialised'
where tournament_id = 16;


SELECT type, max_rounds, COUNT(round_id)
FROM tournaments
JOIN rounds ON tournaments.tournament_id = rounds.tournament_id
WHERE tournaments.tournament_id = 17
GROUP BY type, max_rounds;


SELECT round_id FROM rounds WHERE tournament_id = 16 ORDER BY round_number DESC LIMIT 1;

alter table tournaments
add column status TEXT NOT NULL;


SELECT 
    p.white_player_id AS player_id,
    CASE 
        WHEN p.result = '1-0' THEN 1.0 
        WHEN p.result = '1/2-1/2' THEN 0.5 
        WHEN p.result = 'bye' THEN 0.0
        ELSE 0.0 
    END AS points
FROM pairings p
JOIN rounds r ON p.round_id = r.round_id
WHERE r.tournament_id = 16 AND r.round_number < 4

UNION ALL

SELECT 
    p.black_player_id AS player_id,
CASE 
    WHEN p.result = '0-1' THEN 1.0 
    WHEN p.result = '1/2-1/2' THEN 0.5
    WHEN p.result = 'bye' THEN 0.0 
    ELSE 0.0 
END AS points
FROM pairings p
JOIN rounds r ON p.round_id = r.round_id
WHERE r.tournament_id = 16 AND r.round_number < 4 AND p.black_player_id iS NOT NULL;



SELECT 
    p.white_player_id AS player_id, 
    p.black_player_id AS opponent_id
FROM pairings p
JOIN rounds r ON p.round_id = r.round_id
WHERE r.tournament_id = 16 AND p.black_player_id IS NOT NULL

UNION ALL

SELECT 
    p.black_player_id AS player_id, 
    p.white_player_id AS opponent_id
FROM pairings p
JOIN rounds r ON p.round_id = r.round_id
WHERE r.tournament_id = 16 AND p.black_player_id IS NOT NULL;


SELECT players.player_id, pairings.result
FROM pairings
JOIN entries ON players.player_id = entries.player_id
JOIN rounds ON pairings.round_id = rounds.round_id
WHERE rounds.tournament_id = 16 AND rounds.round_number = 1 AND players.player_id = 1;

SELECT pairings.result FROM pairings WHERE player_id = 13 ORDER BY round DESC LIMIT 1;

SELECT 
    p.white_player_id AS player_id,
    CASE 
        WHEN p.result = '1-0' THEN 1.0 
        WHEN p.result = '1/2-1/2' THEN 0.5 
        WHEN p.result = 'bye' THEN 0.5
        ELSE 0.0 
    END AS points
FROM pairings p
JOIN rounds r ON p.round_id = r.round_id
WHERE r.tournament_id = 23 AND r.round_number < 3

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
WHERE r.tournament_id = 23 AND r.round_number < 3 AND p.black_player_id iS NOT NULL;


SELECT 
    r.round_number, 
    p.result,
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
ORDER BY r.round_number ASC;


SELECT 
    r.round_number, 
    p.result,
    p.white_player_id,
    p.black_player_id,
    CASE 
        WHEN (p.white_player_id = 17 AND p.result = '1-0') OR 
             (p.black_player_id = 17 AND p.result = '0-1') THEN 'W'
        WHEN (p.white_player_id = 17 AND p.result = '0-1') OR 
             (p.black_player_id = 17 AND p.result = '1-0') THEN 'L'
        WHEN p.result = '1/2-1/2' THEN 'D'
        WHEN p.result = 'bye' THEN 'B'
        ELSE 'U'
    END AS outcome
FROM pairings p
JOIN rounds r ON p.round_id = r.round_id
WHERE (p.white_player_id = 17 OR p.black_player_id = 17)
  AND r.tournament_id = 23 AND r.round_number < 6
ORDER BY r.round_number ASC;


SELECT pg_get_serial_sequence('users', 'user_id');
ALTER SEQUENCE public.predefined_pair_id_seq RESTART WITH 1;




SELECT 
    p.white_player_id AS player_id,
    CASE 
        WHEN p.result = '1-0' THEN 1.0 
        WHEN p.result = '1/2-1/2' THEN 0.5 
        WHEN p.result = 'bye' THEN 3
        ELSE 0.0 
    END AS points
FROM pairings p
JOIN rounds r ON p.round_id = r.round_id
WHERE r.tournament_id = 4 AND r.round_number < 2

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
WHERE r.tournament_id = 4 AND r.round_number < 2 AND p.black_player_id iS NOT NULL;