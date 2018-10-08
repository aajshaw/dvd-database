'use strict'

module.exports = function(db) {
  let film = {
    create: function(name, callback) {
      db.run('insert into films (name) values (?)', [name], function(err) {
        callback(err ? err : null);
      });
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
      db.get(`select *,
                     strftime('%d-', watched) ||
                     case strftime('%m', watched)
                     when '01' then 'Jan'
                     when '02' then 'Feb'
                     when '03' then 'Mar'
                     when '04' then 'Apr'
                     when '05' then 'May'
                     when '06' then 'Jun'
                     when '07' then 'Jul'
                     when '08' then 'Aug'
                     when '09' then 'Sep'
                     when '10' then 'Oct'
                     when '11' then 'Nov'
                     when '12' then 'Dec'
                     end ||
                     strftime('-%Y', watched) as film_watched_date
               from films where id = ?`, [id], function(err, row) {
        if (err) {
          throw err;
        }
        callback(row);
      });
    },
    fetchRandom: function(callback) {
      db.get(`select *,
                     strftime('%d-', watched) ||
                     case strftime('%m', watched)
                     when '01' then 'Jan'
                     when '02' then 'Feb'
                     when '03' then 'Mar'
                     when '04' then 'Apr'
                     when '05' then 'May'
                     when '06' then 'Jun'
                     when '07' then 'Jul'
                     when '08' then 'Aug'
                     when '09' then 'Sep'
                     when '10' then 'Oct'
                     when '11' then 'Nov'
                     when '12' then 'Dec'
                     end ||
                     strftime('-%Y', watched) as film_watched_date
                from films order by random() limit 1`, function(err, row) {
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
        db.all(`select f.id,
                       f.name,
                       f.watched,
                       strftime('%d-', f.watched) ||
                       case strftime('%m', f.watched)
                       when '01' then 'Jan'
                       when '02' then 'Feb'
                       when '03' then 'Mar'
                       when '04' then 'Apr'
                       when '05' then 'May'
                       when '06' then 'Jun'
                       when '07' then 'Jul'
                       when '08' then 'Aug'
                       when '09' then 'Sep'
                       when '10' then 'Oct'
                       when '11' then 'Nov'
                       when '12' then 'Dec'
                       end ||
                       strftime('-%Y', f.watched) as film_watched_date,
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
                       f.watched,
                       strftime('%d-', f.watched) ||
                       case strftime('%m', f.watched)
                       when '01' then 'Jan'
                       when '02' then 'Feb'
                       when '03' then 'Mar'
                       when '04' then 'Apr'
                       when '05' then 'May'
                       when '06' then 'Jun'
                       when '07' then 'Jul'
                       when '08' then 'Aug'
                       when '09' then 'Sep'
                       when '10' then 'Oct'
                       when '11' then 'Nov'
                       when '12' then 'Dec'
                       end ||
                       strftime('-%Y', f.watched) as film_watched_date,
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
    setWatched: function(id, callback) {
      db.run("update films set watched = date('now') where id = ?", [id], callback);
    },
    delete: function(id, callback) {
      db.run('delete from films where id = ?', [id], callback);
    }
  };

  return film;
}
