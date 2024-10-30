-- create database called chess_manager_database
CREATE DATABASE chess_manager_database;

--create entity users
CREATE TABLE users(
    user_ID SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    firstname VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL;
);


ALTER TABLE users
ADD COLUMN password VARCHAR(30) NOT NULL,
ADD COLUMN firstname VARCHAR(30) NOT NULL,
ADD COLUMN surname VARCHAR(30) NOT NULL;


ALTER TABLE users
ADD COLUMN email VARCHAR(50) NOT NULL;

ALTER TABLE users
ALTER COLUMN username TYPE VARCHAR(50),
ALTER COLUMN password TYPE VARCHAR(50),
ALTER COLUMN firstname TYPE VARCHAR(50),
ALTER COLUMN surname TYPE VARCHAR(50);

INSERT INTO users (username, password, firstname, surname, email)
VALUES ('t', 'p', 'M', 'T', 'm@g.com');