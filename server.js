'use strict'

const express = require('express');
const app = express();

const port = process.env.PORT || 8080

const passport = require('passport');
const flash = require('connect-flash');

const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

const db = require('./db/db')();

require('./config/passport')(passport, db); // pass passport for configuration

// Set up express application
app.use(morgan('dev'));
app.use(cookieParser());
//app.use(bodyParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

// Set up passport
app.use(session({
  secret: 'reallydumbsecret', // I would NEVER do this in production code
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./app/routes.js')(app, passport, db);

app.listen(port);
console.log("Listening on port " + port);
