'use strict'

const bcrypt = require('bcrypt-nodejs');

module.exports = function(db) {
  let user = {
    create: function() {
      let user = {
        _id: null,
        username: null,
        password: null
      };
      user.generateHash = function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(4), null);
      };
      user.validPassword = function(password) {
        return bcrypt.compareSync(password, this.password);
      }
      user.save = function(callback) {
        let me = this;
        db.run('insert into users (username, password) values (?, ?)',
               [this.username, this.password],
               function(err) {
                 if (err) {
                   callback(err);
                 } else {
                   me._id = this.lastID;
                   callback(null);
                 }
               });
      };

      return user;
    },
    make: function(attrs) {
      let user = this.create();

      user._id = attrs._id;
      user.username = attrs.username;
      user.password = attrs.password;

      return user;
    },
    findByUsername: function(username, callback) {
      let me = this;

      db.get('select distinct oid as _id, * from users where username = ?', username, function(err, row) {
        if (err) {
          throw err;
        }
        if (row) {
          let user = me.make(row);
          callback(null, user);
        } else {
          callback(null, null);
        }
      });
    },
    findOne: function(username, callback) {
      let me = this;

      db.get('select oid as _id, * from users where username = ?', [username], function(err, row) {
        if (err) {
          throw err;
        }
        if (row) {
          callback(null, me.make(row));
        } else {
          callback(null, null);
        }
      });
    },
    findById: function(id, callback) {
      let me = this;

      db.get('select oid as _id, * from users where oid = ?', [id], function(err, row) {
        if (err) {
          consol.log('ERROR');
          throw err;
        }
        if (row) {
          callback(null, me.make(row));
        } else {
          callback(null, null);
        }
      });
    }
  };

  return user;
};
