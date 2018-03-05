'use strict'

const LocalStrategy = require('passport-local').Strategy;

// Load the user 'model'
//const User = require('../app/models/user');

// expose this function to app using module exports
module.exports = function(passport, db) {
  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    console.log("serializeUser()");
    console.dir(user);
    done(null, user._id)
  });
  // used to deserialize user
  passport.deserializeUser(function(id, done) {
    db.user.findById(id, function(err, user) {
      console.log("callback from findById in deserializeUser");
      console.dir(user);
      console.dir(done);
      done(err, user);
    });
  });

  passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password
    usernameField : 'username',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, username, password, done) {
    // Change next line to a 'user' method?
    // db.get('select distinct oid as _id, * from users where username = ?', 'aajshaw', function(err, row) {
    //   if (err) {
    //     throw err;
    //   }
    //   if (row) {
    //     console.log("got row");
    //     var user = db.user.make(row); // create should be a 'user' method
    //   } else {
    //     console.log("missing row");
    //   }
    // });
    // asynchronous
    // User.findOne wont fire unless data is sent back
    process.nextTick(function() {
      // find a user whose username is the same as the forms username
      // we are checking to see if the user trying to login already exists
      db.user.findByUsername(username, function(err, user) {
        console.log("callback from findByUsername");
        // if there are any errors, return the error
        if (err)
          return done(err);
        // check to see if theres already a user with that username
        if (user) {
          return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
        } else {
          console.log("NEW USER");
          // if there is no user with that username
          // create the user
          let newUser = db.user.create();
          // set the user's local credentials
          newUser.username = username;
          console.log("About to hash password");
          console.dir(password);
          newUser.password = newUser.generateHash(password);
          console.log("Hashed password...");
          console.dir(newUser.password);
          // save the user
          newUser.save(function(err) {
            if (err) {
              throw err;
            }
            console.log("About to return after saving new user");
            console.dir(newUser);
            return done(null, newUser);
          });
        }
      });
    });
  }));

  passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, username, password, done) {
    db.user.findByUsername(username, function(err, user) {
      console.log("GOT USER");
      console.dir(user);
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, req.flash('loginMessage', 'No user found'));
      }
      if (!user.validPassword(password)) {
        return done(null, false, req.flash('loginMessage', "Wrong password"));
      }
      return done(null, user);
    });
  }));
}
