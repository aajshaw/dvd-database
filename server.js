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

// const sqlite3 = require('sqlite3').verbose();
//
// const configDB = require('./config/database.js');
// //const dbPromise = sqlite.open(configDB.file, { Promise });
// var db = new sqlite3.Database(configDB.file, (err) => {
//   if (err) {
//     console.error(err.message);
//   }
//   console.log('Connected to database');
//   db.get('select distinct oid as _id, * from users where username = ?', 'aajshaw', function(err, row) {
//     if (err) {
//       throw err;
//     }
//     if (row) {
//       console.log("got row");
//       var user = create(row);
//     } else {
//       console.log("missing row");
//     }
//   });
// });
const db = require('./db/db')();
//console.dir(db);
//db.user.findByUsername('aajshaw');

// Connect to database?

require('./config/passport')(passport, db); // pass passport for configuration

// Set up express application
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());
app.set('view engine', 'ejs');

// Set up passport
app.use(session({
  secret: 'reallydumbsecret' // I would NEVER do this in production code
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./app/routes.js')(app, passport);

app.listen(port);
console.log("Listening on port " + port);
