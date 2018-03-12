'use strict'

module.exports = function() {
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database('./db/dvds.sqlite', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to database');
  });
  db.user = require('../app/models/user')(db);
  db.film = require('../app/models/film')(db);
  db.collection = require('../app/models/collection')(db);
  db.collection_film = require('../app/models/collection_film')(db);

  return db;
};
