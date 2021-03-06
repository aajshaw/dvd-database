'use strict'

const moment = require('moment');

module.exports = function(app, passport, db) {
  // HOME PAGE (with login links)
  app.get('/', function(req, res) {
    db.user.count(function(userCount) {
      if (userCount < 2) {
        res.render('pages/index.ejs');
      } else {
        res.render('pages/login.ejs', { message: req.flash('loginMessage'), showSignup: false });
      }
    })
  });
  // LOGIN
  app.get('/login', function(req, res) {
    db.user.count(function(userCount) {
    // render and pass in flash data if it exists
      res.render('pages/login.ejs', { message: req.flash('loginMessage'), showSignup: userCount < 2 });
    })
  });
  // Process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  }));

  // SIGNUP
  app.get('/signup', function(req, res) {
    db.user.count(function(userCount) {
      if (userCount < 2) {
        res.render('pages/signup.ejs', { message: req.flash('signupMessage') });
      } else {
        res.render('pages/login.ejs', { message: req.flash('loginMessage'), showSignup: false });
      }
    })
  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/dashboard',
    failureRedirect : '/signup',
    failureFlash: true
  }));

  app.get('/random_film/:from', function(req, res) {
    db.film.fetchRandom(function(film) {
      switch (req.params['from']) {
        case 'index':
          res.render('pages/index.ejs', {randomFilm: film});
          break;
        case 'login':
          db.user.count(function(userCount) {
          // render and pass in flash data if it exists
            res.render('pages/login.ejs', { randomFilm: film, message: req.flash('loginMessage'), showSignup: userCount < 2 });
          });
          break;
        case 'signup':
          db.user.count(function(userCount) {
            if (userCount < 2) {
              res.render('pages/signup.ejs', { randomFilm: film, message: req.flash('signupMessage') });
            } else {
              res.render('pages/login.ejs', { randomFilm: film, message: req.flash('loginMessage'), showSignup: false });
            }
          });
          break;
        default:
          res.render('pages/index.ejs', {randomFilm: film});
      }
    });
  });

  app.get('/dashboard', isLoggedIn, function(req, res) {
    db.collection.count(function(collectionSize) {
      db.film.count(function(filmSize) {
        db.collection_film.count(function(collectionFilmSize) {
          res.render('pages/dashboard.ejs', {
            user: req.user,
            filmSize: filmSize,
            collectionSize: collectionSize,
            collectionFilmSize: collectionFilmSize
          })
        })
      })
    })
  });

  app.get('/backup', isLoggedIn, function(req, res) {
    res.download(__dirname + '/../db/dvds.sqlite', 'dvds_' + moment().format('YYYY-MM-DD_HHmmss') + '.backup');
  });

  app.get('/films', isLoggedIn, function(req, res) {
    db.film.fetchAll(function(films) {
      res.render('pages/films', { films: films })
    })
  });

  app.post('/films/filter', isLoggedIn, function(req, res) {
    db.film.fetchWithNameFilter(req.body['filter'], function(films) {
      res.render('pages/films', { films: films, filter: req.body['filter'] })
    })
  });

  app.get('/film/random', isLoggedIn, function(req, res) {
    db.film.fetchRandom(function(film) {
      db.collection_film.fetchCollectionsForFilm(film.id, function(collections) {
        res.render('pages/film_random', { film: film, collections: collections });
      })
    })
  });

  app.get('/film/delete/:id', isLoggedIn, function(req, res) {
    db.collection_film.deleteFilm(req.params['id'], function() {
      db.film.delete(req.params['id'], function() {
        db.film.fetchAll(function(films) {
          res.render('pages/films', { films: films })
        })
      })
    })
  });

  app.get('/film/:film_id/add_to/:collection_id', isLoggedIn, function(req, res) {
    db.collection_film.create(req.params['collection_id'], req.params['film_id'], function(err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send('OK');
      }
    });
  });

  app.get('/film/:id/add_to_collections', isLoggedIn, function(req, res) {
    db.film.fetchById(req.params['id'], function(film) {
      db.collection_film.fetchCollectionsWithoutFilm(req.params['id'], function(collections) {
        res.render('pages/film_add_to_collection', { film: film, collections: collections })
      })
    })
  });

  app.get("/film/:id/remove_from_collections", isLoggedIn, function(req, res) {
    db.film.fetchById(req.params['id'], function(film) {
      db.collection_film.fetchCollectionsForFilm(req.params['id'], function(collections) {
        res.render('pages/film_remove_from_collection', { film: film, collections: collections })
      })
    })
  });

  app.get('/film/:film_id/remove_from/:collection_id', isLoggedIn, function(req, res) {
    db.collection_film.delete(req.params['collection_id'], req.params['film_id'], function() {
      res.status(200).send('OK');
    })
  });

  app.get('/film/:id/watched', isLoggedIn, function(req, res) {
    db.film.setWatched(req.params['id'], function() {
      db.film.fetchById(req.params['id'], function(film) {
        db.collection_film.fetchCollectionsForFilm(req.params['id'], function(collections) {
          res.render('pages/film', { film: film, collections: collections })
        })
      })
    })
  });

  app.get('/film/:id', isLoggedIn, function(req, res) {
    db.film.fetchById(req.params['id'], function(film) {
      db.collection_film.fetchCollectionsForFilm(req.params['id'], function(collections) {
        res.render('pages/film', { film: film, collections: collections })
      })
    })
  });

  app.get('/create/film', isLoggedIn, function(req, res) {
    res.render('pages/create_film');
  });

  app.post('/create/film', isLoggedIn, function(req, res) {
    if (req.body.film_name.length > 0) {
      db.film.exists(req.body.film_name, function(exists) {
        if (exists) {
          res.render('pages/create_film', { message: `Film ${req.body.film_name} already exists` });
        } else {
          db.film.create(req.body.film_name, function(err) {
            if (err) {
              res.render('pages/create_film', { message: `Could not add film ${req.body.film_name}, error ${err}`});
            } else {
              res.render('pages/create_film', { message: `Film ${req.body.film_name} added` });
            }
          });
        }
      });
    } else {
      res.render('pages/create_film', { message: 'No film name given'});
    }
  });

  app.get('/collections', isLoggedIn, function(req, res) {
    db.collection.fetchAll(function(collections) {
      res.render('pages/collections', { collections: collections })
    });
  });

  app.post('/collections/filter', isLoggedIn, function(req, res) {
    db.collection.fetchWithNameFilter(req.body['filter'], function(collections) {
      res.render('pages/collections', { collections: collections, filter: req.body['filter'] })
    })
  });

  app.get('/collection/random', isLoggedIn, function(req, res) {
    db.collection.fetchRandom(function(collection) {
      db.collection_film.fetchFilmsForCollection(collection.id, function(films) {
        res.render('pages/collection_random', { collection: collection, films: films });
      })
    })
  });

  app.get('/collection/delete/:id', isLoggedIn, function(req, res) {
    db.collection_film.deleteCollection(req.params['id'], function() {
      db.collection.delete(req.params['id'], function() {
        db.collection.fetchAll(function(collections) {
          res.render('pages/collections', { collections: collections })
        })
      })
    })
  });

  app.get('/collection/:id/random_film', isLoggedIn, function(req, res) {
    db.collection_film.fetchRandomFilmFromCollection(req.params['id'], function(film) {
      db.collection_film.fetchCollectionsForFilm(film.id, function(collections) {
        res.render('pages/film_random', { film: film, collections: collections });
      })
    })
  });

  app.get('/collection/:id', isLoggedIn, function(req, res) {
    db.collection.fetchById(req.params['id'], function(collection) {
      db.collection_film.fetchFilmsForCollection(req.params['id'], function(films) {
        res.render('pages/collection', { collection: collection, films: films });
      })
    })
  });

  app.get('/create/collection', isLoggedIn, function(req, res) {
    res.render('pages/create_collection');
  });

  app.post('/create/collection', isLoggedIn, function(req, res) {
    if (req.body.collection_name.length > 0) {
      db.collection.exists(req.body.collection_name, function(exists) {
        if (exists) {
          res.render('pages/create_collection', { message: `Collection ${req.body.collection_name} already exists` });
        } else {
          db.collection.create(req.body.collection_name, function(err) {
            if (err) {
              res.render('pages/create_collection', { message: `Could not add collection ${req.body.collection_name}, error ${err}`});
            } else {
              res.render('pages/create_collection', { message: `Collection ${req.body.collection_name} added` });
            }
          });
        }
      });
    } else {
      res.render('pages/create_collection', { message: 'No collection name given'});
    }
  });

  app.get('/collection_films/sort/:sort', isLoggedIn, function(req, res) {
    db.collection_film.fetchData(req.params['sort'], function(collectionFilms) {
      res.render('pages/collection_films', { collectionFilms: collectionFilms })
    })
  });

  app.get('/collection_films', isLoggedIn, function(req, res) {
    db.collection_film.fetchData(function(collectionFilms) {
      res.render('pages/collection_films', { collectionFilms: collectionFilms })
    })
  });

  app.get('/collection/:collection_id/add/:film_id', isLoggedIn, function(req, res) {
    db.collection_film.create(req.params['collection_id'], req.params['film_id'], function(err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send('OK');
      }
    });
  });

  app.get("/collection/:id/remove_films", isLoggedIn, function(req, res) {
    db.collection.fetchById(req.params['id'], function(collection) {
      db.collection_film.fetchFilmsForCollection(req.params['id'], function(films) {
        res.render('pages/collection_remove_films', { collection: collection, films: films, })
      })
    })
  });

  app.get('/collection/:collection_id/remove/:film_id', isLoggedIn, function(req, res) {
    db.collection_film.delete(req.params['collection_id'], req.params['film_id'], function() {
      res.status(200).send('OK');
    })
  });

  app.get('/collection/:id/add_films', isLoggedIn, function(req, res) {
    db.collection.fetchById(req.params['id'], function(collection) {
      db.collection_film.fetchFilmsNotInCollection(req.params['id'], function(films) {
        res.render('pages/collection_add_film',
                   {
                     collection: collection,
                     films: films
                   })
      })
    })
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
  }
  // Not authenticated, back to home page
  res.redirect  ('/');
}
