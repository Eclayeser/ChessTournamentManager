-- create database called chess_manager_database
CREATE DATABASE chess_manager_database;

--create table users for authentification: id primary, username, other to be added later
CREATE TABLE users(
    user_ID SERIAL PRIMARY KEY,
    username VARCHAR(40)
);