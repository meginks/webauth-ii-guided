const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session'); 
const KnexSessionStore = require('connect-session-knex')(session); // class syntax, object literal
const dbConfig = require('../database/dbConfig.js');
const authRouter = require('../auth/auth-router.js');
const usersRouter = require('../users/users-router.js');

const server = express();

const sessionConfig = {
  name: 'monkey-pants',  // default is 'sid' but that would reveal our stack which is undesirable
  secret: process.env.SECRET || 'the moon landing was a hoax', // typically be an environment variable for extra security -- encrypts/decrypts the cookie 
  cookie: {
    maxAge: 1000 * 60 * 60, // how long session is valid for in milliseconds 
    secure: false, // cookie allowed over https only? in production this would be true, it is false now because we are in development 
    httpOnly: true, // you can't access the cookie from JS using document.cookie. 
  }, 
  resave: false, // keep it false to avoid recreating sessions that haven't changed
  saveUninitialized: false, // GDPR laws against setting cookies automatically 
  store: new KnexSessionStore({
    knex: dbConfig, // configured instance of knex 
    tablename: 'sessions', // table will store sessions inside the DB - we can name it anything we want
    sidfieldname: 'sid', // column that will hold the session ID -- name it anything you want
    createtable: true, // if table doesn't exist, make it automatically 
    clearInterval: 1000*60*10 // time it takes to check for old sessions and remove them from the database to keep it clean and performant
  })
  } // this holds the configuration for the session  

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig)); 


server.use('/api/auth', authRouter);
server.use('/api/users', usersRouter);

server.get('/', (req, res) => {
  res.send("It's alive!");
});

module.exports = server;
