'use strict'

const LocalStrategy = require('passport-local').Strategy;


// expose this function to app using module exports
module.exports = function(passport, db) {
  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user._id)
  });
  // used to deserialize user
  passport.deserializeUser(function(id, done) {
    db.user.findById(id, function(err, user) {
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
    // asynchronous
    // User.findOne wont fire unless data is sent back
    process.nextTick(function() {
      // find a user whose username is the same as the forms username
      // we are checking to see if the user trying to login already exists
      db.user.findByUsername(username, function(err, user) {
        // if there are any errors, return the error
        if (err)
          return done(err);
        // check to see if theres already a user with that username
        if (user) {
          return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
        } else {
          // if there is no user with that username
          // create the user
          let newUser = db.user.create();
          // set the user's local credentials
          newUser.username = username;
          newUser.password = newUser.generateHash(password);
          // save the user
          newUser.save(function(err) {
            if (err) {
              throw err;
            }
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
