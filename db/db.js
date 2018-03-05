'use strict'

module.exports = function() {
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database('./db/dvds.sqlite', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to database');
  });
  db.user = require('../app/models/user')(db)

  return db;
};
