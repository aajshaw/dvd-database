'use strict'

module.exports = function(app, passport) {
  // HOME PAGE (with login links)
  app.get('/', function(req, res) {
    res.render('pages/index.ejs');
  });
  // LOGIN
  app.get('/login', function(req, res) {
    // render and pass in flash data if it exists
    res.render('pages/login.ejs', { message: req.flash('loginMessage') });
  });
  // Process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  }));

  // SIGNUP
  app.get('/signup', function(req, res) {
    res.render('pages/signup.ejs', { message: req.flash('signupMessage') });
  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/dashboard',
    failureRedirect : '/signup',
    failureFlash: true
  }));

  // Dashboard
  // Protected, have to be logged in
  app.get('/dashboard', isLoggedIn, function(req, res) {
    let films = [
      { name: 'The Dirty Dozen' },
      { name: 'The Good, The Bad and The ugly' },
      { name: 'For a few dollars more' }
    ];
    let filmSize = 3;
    let collectionSize = 10;
    console.dir(req);
    res.render('pages/dashboard.ejs', {
      user: req.user,
      films: films,
      filmSize: filmSize,
      collectionSize: collectionSize
    });
  });

  // LOGOUT
  app.get('logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });
};

// route middleware to make sure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
    //next();
  }
  // Not authenticated, back to home page
  res.redirect  ('/');
}
