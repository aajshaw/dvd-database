'use strict'

module.exports = function(app, passport, db) {
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
//    let collectionSize = 10;
    db.collection.count(function(collectionSize) {
      res.render('pages/dashboard.ejs', {
        user: req.user,
        films: films,
        filmSize: filmSize,
        collectionSize: collectionSize
      })
    })
  });

  app.get('/collections', isLoggedIn, function(req, res) {
    // let collections = [
    //   { id: 1, name: 'Star Wars' },
    //   { id: 2, name: 'The Mummy' },
    //   { id: 3, name: 'James Bond' }
    // ];
    db.collection.fetchAll(function(collections) {
//    db.collection.fetchWithNameFilter('i', function(collections) {
      res.render('pages/collections', {
        collections: collections
      })
    });
  });

  app.get('/collection/:id', isLoggedIn, function(req, res) {
    db.collection.fetchById(req.params['id'], function(collection) {
      res.render('pages/collection', { collection: collection })
    })
    // let collection = { id: req.params['id'], name: 'Star Wars', itemCount: 7 };
    // res.render('pages/collection', {
    //   collection: collection
    // });
  });

  app.get('/create/collection', isLoggedIn, function(req, res) {
    res.render('pages/create_collection');
  });

  app.post('/create/collection', isLoggedIn, function(req, res) {
    // Check if collection already exists
    // create collection
    // return to collections page
//     console.dir(req.body);
//     if (true || db.collection.exists(req.body.collection_name)) {
//       console.log("WTF");
//       res.render('pages/create_collection', { message: `Collection ${req.body.collection_name} already exists`});
// //      req.flash('createCollection', `Collection ${req.body.collection_name} already exists`);
//     } else {
//       console.log("WTF2");
//       res.redirect('/collections')
//     }
    //res.render('pages/collections');
    db.collection.exists(req.body.collection_name, function(exists) {
      if (exists) {
        res.render('pages/create_collection', { message: `Collection ${req.body.collection_name} already exists` });
      } else {
        let collection = db.collection.create();
        collection.name = req.body.collection_name;
        collection.save(function(err) {
          if (err) {
            res.render('pages/create_collection', { message: `Could not add collection ${req.body.collection_name}, error ${err}`});
          } else {
            res.render('pages/create_collection', { message: `Collection ${req.body.collection_name} added` });
          }
        });
      }
    });
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
