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
    fetchRandom: function(callback) {
      db.get('select * from films order by random() limit 1', function(err, row) {
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
      console.dir(filter);
      if (filter) {
        db.all(`select f.id,
                       f.name,
                       (select count(*)
                          from collection_films cf
                         where cf.film_id = f.id) as collection_count
                  from films f
                 where lower(f.name) like '%' || lower(?) || '%'
                 order by f.name`,
               [filter], function(err, rows) {
          if (err) {
            throw err;
          }
          callback(rows);
        });
      } else {
        db.all(`select f.id,
                       f.name,
                       (select count(*)
                          from collection_films cf
                         where cf.film_id = f.id) as collection_count
                  from films f
                 order by name`,
               function(err, rows) {
          if (err) {
            throw err;
          }
          callback(rows);
        });
      }
    },
    fetchAll: function(callback) {
      this.fetchWithNameFilter(callback);
    },
    delete: function(id, callback) {
      db.run('delete from films where id = ?', [id], callback);
    }
  };

  return film;
}
