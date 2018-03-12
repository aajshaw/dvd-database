'use strict'

module.exports = function(db) {
  let film = {
    create: function() {
      let film = {
        id: null,
        name: null
      };
      film.save = function(callback) {
        let me = this;
        db.run('insert into films (name) values (?)', [this.name], function(err) {
          if (err) {
            callback(err);
          } else {
            me.id = this.lastID;
            callback(null);
          }
        });
      };

      return film;
    },
    exists: function(name, callback) {
      db.get('select count(*) as count from films where name = ?', [name], function(err, row) {
        if (err) {
          throw err;
        }
        callback(0 != row.count);
      });
    },
    count: function(callback) {
      db.get('select count(*) as count from films', function(err, row) {
        if (err) {
          throw err;
        }
        callback(row.count);
      });
    },
    fetchById: function(id, callback) {
      db.get('select * from films where id = ?', [id], function(err, row) {
        if (err) {
          throw err;
        }
        callback(row);
      });
    },
    fetchWithNameFilter: function(filter, callback) {
      if (typeof filter == "function") {
        callback = filter;
        filter = null;
      }
      if (filter) {
        console.log("WTF filter = " + filter);
        db.all("select * from films where lower(name) like '%' || lower(?) || '%' order by name", [filter], function(err, rows) {
          if (err) {
            throw err;
          }
          callback(rows);
        });
      } else {
        console.log("No filter");
        db.all('select * from films order by name', function(err, rows) {
          if (err) {
            throw err;
          }
          console.dir(rows);
          callback(rows);
        });
      }
    },
    fetchAll: function(callback) {
      this.fetchWithNameFilter(callback);
    }
  };

  return film;
}
