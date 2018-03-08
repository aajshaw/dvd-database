'use strict'

module.exports = function(db) {
  let collectionFilms = {
    create: function() {
      let collectionFilm = {
        collectionID: null,
        filmID: null
      };
      collectionFilm.save = function(callback) {
        let me = this;
        db.run('insert into collection_films (collection_id, film_id) values (?, ?)', [this.collectionID, this.fileID], function(err) {
          if (err) {
            callback(err);
          } else {
            callback(null);
          }
        });
      };

      return collectionFilm;
    },
    countFilmsInCollection: function(id, callback){
      db.get('select count(*) as count from collection_films where collection_id = ?', [id], function(err, row) {
        if (err) {
          throw err;
        }
        callback(row.count);
      })
    }
  };

  return collectionFilm;
}
