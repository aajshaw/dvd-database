'use strict'

module.exports = function(db) {
  let collectionFilm = {
    create: function() {
      let collectionFilm = {
        collectionID: null,
        filmID: null
      };
      collectionFilm.save = function(callback) {
        let me = this;
        db.run('insert into collection_films (collection_id, film_id) values (?, ?)', [this.collectionID, this.filmID], function(err) {
          if (err) {
            callback(err);
          } else {
            callback(null);
          }
        });
      };

      return collectionFilm;
    },
    count: function(callback) {
      db.get('select count(*) as count from collection_films', function(err, row) {
        if (err) {
          throw err;
        }
        callback(row.count);
      });
    },
    countFilmsInCollection: function(id, callback) {
      db.get('select count(*) as count from collection_films where collection_id = ?', [id], function(err, row) {
        if (err) {
          throw err;
        }
        callback(row.count);
      });
    },
    fetchData: function(sort, callback) {
      if (typeof(sort) == "function") {
        callback = sort;
        sort = "collectionAsc";
      }

      let orderBy;
      switch (sort) {
        case "collectionAsc":
          orderBy = "c.name, f.name";
          break;
        case "collectionDesc":
          orderBy = "c.name desc, f.name";
          break;
        case "filmAsc":
          orderBy = "f.name, c.name";
          break;
        case "filmDesc":
          orderBy = "f.name desc, c.name";
          break;
        default:
          orderBy = "c.name, f.name";
      }

      db.all(`select c.id as collection_id,
                     c.name as collection_name,
                     f.id as film_id,
                     f.name as film_name
                from collection_films cf,
                     collections c,
                     films f
               where cf.collection_id = c.id
                 and cf.film_id = f.id
               order by ${orderBy}`,
             function(err, rows) {
        if (err) {
          throw err;
        }
        callback(rows);
      });
    },
    fetchFilmsForCollection: function(id, callback) {
      db.all(`select f.id,
                     f.name
                from films f,
                     collection_films cf
               where cf.collection_id = ?
                 and f.id = cf.film_id
               order by f.name`,
             [id],
             function(err, rows) {
        if (err) {
          throw err;
        }
        callback(rows);
      });
    },
    fetchFilmsNotInCollection: function(id, callback) {
      db.all(`select f.id,
                     f.name
                from films f
               where not exists (select *
                                   from collection_films cf
                                  where cf.collection_id = ?
                                    and cf.film_id = f.id)
               order by f.name`,
             [id],
             function(err, rows) {
        if (err) {
          throw err;
        }
        callback(rows);
      });
    },
    fetchCollectionsForFilm: function(id, callback) {
      db.all(`select c.id,
                     c.name
                from collections c,
                     collection_films cf
               where cf.film_id = ?
                 and c.id = cf.collection_id
               order by c.name`,
             [id],
             function(err, rows) {
        if (err) {
          throw err;
        }
        callback(rows);
      });
    },
    fetchCollectionsWithoutFilm: function(id, callback) {
      db.all(`select c.id,
                     c.name
                from collections c
               where not exists (select *
                                   from collection_films cf
                                  where cf.film_id = ?
                                    and cf.collection_id = c.id)
               order by c.name`,
             [id],
             function(err, rows) {
        if (err) {
          throw err;
        }
        callback(rows);
      });
    },
    delete: function(collection_id, film_id, callback) {
      db.run(`delete from collection_films
               where collection_id = ?
                 and film_id = ?`,
             [collection_id, film_id],
           callback);
    },
    deleteFilm: function(film_id, callback) {
      db.run('delete from collection_films where film_id = ?', [film_id], callback);
    },
    deleteCollection: function(collection_id, callback) {
      db.run('delete from collection_films where collection_id = ?', [collection_id], callback);
    }
  };

  return collectionFilm;
}
