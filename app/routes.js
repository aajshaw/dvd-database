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
    res.render('pages/dashboard.ejs', {
      user: req.user,
      films: films,
      filmSize: filmSize,
      collectionSize: collectionSize
    });
  });

  app.get('/collections', isLoggedIn, function(req, res) {
    let collections = [
      { id: 1, name: 'Star Wars' },
      { id: 2, name: 'The Mummy' },
      { id: 3, name: 'James Bond' }
    ];
    res.render('pages/collections', {
      collections: collections
    });
  });

  app.get('/collection/:id', isLoggedIn, function(req, res) {
    let collection = { id: req.params['id'], name: 'Star Wars', itemCount: 7 };
    res.render('pages/collection', {
      collection: collection
    });
  });

  app.get('/create/collection', isLoggedIn, function(req, res) {
    res.render('pages/create_collection');
  });

  app.post('/create/collection', isLoggedIn, function(req, res) {
    // Check if collection already exists
    // create collection
    // return to collections page
    res.render('pages/collections');
  });

  // LOGOUT
  app.get('/logout', function(req, res) {
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
