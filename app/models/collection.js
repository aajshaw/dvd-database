'use strict'

module.exports = function(db) {
  let collection = {
    create: function() {
      let collection = {
        id: null,
        name: null
      };
      collection.save = function(callback) {
        let me = this;
        db.run('insert into collections (name) values (?)', [this.name], function(err) {
          if (err) {
            callback(err);
          } else {
            me.id = this.lastID;
            callback(null);
          }
        });
      };

      return collection;
    },
    exists: function(name, callback) {
      db.get('select count(*) as count from collections where name = ?', [name], function(err, row) {
        if (err) {
          throw err;
        }
        callback(0 != row.count);
      });
    },
    count: function(callback) {
      db.get('select count(*) as count from collections', function(err, row) {
        if (err) {
          throw err;
        }
        callback(row.count);
      });
    },
    fetchById: function(id, callback) {
      db.get(`select c.*,
                     (select count(*)
                        from collection_films cf
                       where cf.collection_id = c.id) as film_count
                from collections c
               where c.id = ?`, [id], function(err, row) {
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
        db.all(`select c.*,
                  (select count(*)
                     from collection_films cf
                    where cf.collection_id = c.id) as collection_count
                  from collections c
                 where lower(c.name) like '%' || lower(?) || '%'
                 order by c.name`,
               [filter],
               function(err, rows) {
          if (err) {
            throw err;
          }
          callback(rows);
        });
      } else {
        db.all(`select c.*,
                  (select count(*)
                     from collection_films cf
                    where cf.collection_id = c.id) as collection_count
                  from collections c
                 order by c.name`,
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
    }
  };

  return collection;
}