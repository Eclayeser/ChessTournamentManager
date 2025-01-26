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

--insert data into entity <users>
INSERT INTO users (username, password, firstname, surname, email)
VALUES ('TestUser_1', 'pass1', 'NestaykoNestaykovuch', 'Nestaykov', 'nest@g.com');
--Boundary Data: firstname (20 characters long)

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
    tournament_id SERIAL PRIMARY KEY,               --field for tournament ID, autoincrement, primary key
    user_id INT REFERENCES users(user_ID) NOT NULL, --field for user ID, foreign key, not null
    name VARCHAR(50) NOT NULL,                      --field for tournament name, 50 characters max, not null
    type TEXT NOT NULL,                             --field for tournament type, text, not null
    num_rounds SMALLINT CHECK (num_rounds > 0 AND num_rounds <= 50) NOT NULL,
    --field for total number of rounds, integer, not null, check is between 1 and 50
    max_players SMALLINT CHECK (num_rounds > 0 AND num_rounds <= 1000) NOT NULL,
    --field for maximum number of players, integer, not null, check is between 1 and 1000
    bye_value FLOAT NOT NULL,                       --field for bye value, float, not null
    tie_break TEXT,                                 --field for tie break type, text
    hide_rating BOOLEAN NOT NULL,                    --field for hide rating instruction, boolean, not null
    forbidden INTEGER[][]                           --field for list of forbidden pairs, array of integers
);


--insert data into entity <tournaments>
INSERT INTO tournaments (user_id, name, type, num_rounds, max_players, bye_value, tie_break, hide_rating, forbidden)
VALUES (1, 'TestTournament_1', 'test_type', 5, 1000, 0.5, 'test_tie_break', TRUE, '{{1, 1}}');

INSERT INTO tournaments (user_id, name, type, num_rounds, max_players, bye_value, tie_break, hide_rating, forbidden)
VALUES (2, 'TestTournament_8', 'test_type', 7, 10, 1, 'test_tie_break', TRUE, '{{1, 3}}');
--Boundary Data: max_players (1000)

--update data under hide_ratinh column where tournament_id = 1
UPDATE tournaments
SET forbidden = ARRAY[[1, 2], [2, 3], [5, 4]]
WHERE tournament_id = 7;

-------------------------------------------------------------------------------------------------------------------------

--create entity <players>
CREATE TABLE players(
    player_id SERIAL PRIMARY KEY,  --field for player ID, autoincrement, primary key
    name VARCHAR(50) NOT NULL,     --field for player's name, 50 characters max, not null
    rating SMALLINT CHECK (rating >= 0 AND rating <= 4000), 
    --field for player's rating, integer, check is between 0 and 4000
    email VARCHAR(50),             --field for player's email, 50 characters max
    club VARCHAR(50),              --field for player's club, 50 characters max
    add_points FLOAT CHECK (add_points >= 0 AND add_points <= 50) NOT NULL
    --field for additional points, float, not null, check is between 0 and 50
);

--insert data into entity <players>
INSERT INTO players (name, rating, email, club, add_points)
VALUES ('Nazar4', 4000, 'naz@k.com', 'Bishops', 3.5);
--Boundary Data: rating (4000)

--select all rows from entity <players>
SELECT * FROM players;

--delete record from entity <players> where player_id = 1
DELETE FROM players
WHERE player_id = 1;

-------------------------------------------------------------------------------------------------------------------------

--create entity <entries>
CREATE TABLE entries(
    entry_id SERIAL PRIMARY KEY,            --field for entry ID, autoincrement, primary key
    tournament_id INT REFERENCES tournaments(tournament_ID) NOT NULL, 
    --field for tournament ID, foreign key, not null
    player_id INT REFERENCES players(player_ID) NOT NULL, 
    --field for player ID, foreign key, not null
    score JSON,                             --field for score, json
    predefined INT CHECK (predefined >= 0), --field for predefined next opponrnt, integer, check is positive
    eliminated BOOLEAN NOT NULL             --field for eliminated status, boolean, not null
);


--insert data into entity <entries>
INSERT INTO entries (tournament_id, player_id, score, predefined, eliminated)
VALUES (7, 4, '{"round1": {"colour": "W", "result": 0.5, "opponent_id": 0}, "round2": {"colour": "W", "result": 0.5, "opponent_id": 0}}', NULL, FALSE);


-------------------------------------------------------------------------------------------------------------------------

"SELECT players.* FROM players JOIN entries ON players.player_id = entries.player_id WHERE entries.tournament_id = $1"

--joint selection from entities <tournaments>, <players> and <entries>
SELECT tournaments.name, players.name, players.rating, entries.score
FROM tournaments
--join entity <tournaments> with entity <entries> by tournament_id
JOIN entries ON tournaments.tournament_id = entries.tournament_id
--join entity <players> with entity <entries> by player_id
JOIN players ON entries.player_id = players.player_id;






ALTER TABLE users
ADD COLUMN password VARCHAR(30) NOT NULL,
ADD COLUMN firstname VARCHAR(30) NOT NULL,
ADD COLUMN surname VARCHAR(30) NOT NULL;

ALTER TABLE tournaments
ADD COLUMN forbidden INTEGER[][]; 

ALTER TABLE users
ADD COLUMN email VARCHAR(50) NOT NULL;

ALTER TABLE users
ALTER COLUMN username TYPE VARCHAR(50),
ALTER COLUMN password TYPE VARCHAR(50),
ALTER COLUMN firstname TYPE VARCHAR(50),
ALTER COLUMN surname TYPE VARCHAR(50);

INSERT INTO users (username, password, firstname, surname, email)
VALUES ('t', 'p', 'M', 'T', 'm@g.com');





INSERT INTO tournaments (tournament_name, tournament_type, user_ID)
VALUES ('tournament_1', 'test_type', 8);
INSERT INTO tournaments (tournament_name, tournament_type, user_ID)
VALUES ('tournament_2', 'test_type', 8);
INSERT INTO tournaments (tournament_name, tournament_type, user_ID)
VALUES ('tournament_3', 'test_type', 8);

ALTER TABLE tournaments
ADD COLUMN user_ID INTEGER;





ALTER TABLE tournaments DROP CONSTRAINT tournaments_user_id_fkey;

ALTER TABLE tournaments
ADD CONSTRAINT tournaments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;







CREATE TABLE test (
    general_ID SERIAL PRIMARY KEY,
    nick VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    number SMALLINT NOT NULL,
    data jsonb NOT NULL
);

INSERT INTO test (nick, password, number, data)
VALUES ('MMM', 'pass', 10000, '{"key": "value", "key2": [1, 2, 3]}');