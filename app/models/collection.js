'use strict'

module.exports = function(db) {
  let collection = {
    create : function(name, callback) {
      db.run('insert into collections (name) values (?)', [name], function(err) {
        callback(err ? err : null);
      });
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
      // Make sure never to select a collection with no films in it
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
    fetchRandom: function(callback) {
      db.get(`select *
                from collections c
                where exists(select *
                               from collection_films cf
                              where cf.collection_id = c.id)
               order by random()
               limit 1`, function(err, row) {
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
    },
    delete: function(id, callback) {
      db.run('delete from collections where id = ?', [id], callback);
    }
  };

  return collection;
}
