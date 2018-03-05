'use strict'

const bcrypt = require('bcrypt-nodejs');

module.exports = function(db) {
  let user = {
    create: function() {
      console.log("USER.CREATE() called");
      let user = {
        _id: null,
        username: null,
        password: null
      };
      user.generateHash = function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
      };
      user.validPassword = function(password) {
        return bcrypt.compareSync(password, this.password);
      }
      user.save = function(callback) {
        let me = this;
//        db.run('insert into users (username, password) values (?, ?)', [this.username, this.password], err);
        db.run('insert into users (username, password) values (?, ?)',
               [this.username, this.password],
               function(err) {
                 if (err) {
                   callback(err);
                 }
                 me._id = this.lastID;
                 callback(null);
               });
      }

      return user;
    },
    make: function(attrs) {
      console.log("USER.MAKE() called");
      let user = this.create();

      user._id = attrs._id;
      user.username = attrs.username;
      user.password = attrs.password;

      return user;
    },
    findByUsername: function(username, callback) {
      let me = this;
      console.log('findByUsername()');

      db.get('select distinct oid as _id, * from users where username = ?', username, function(err, row) {
        if (err) {
          throw err;
        }
        if (row) {
          console.log(`Found ${username} ${row}`);
          let user = me.make(row);
          callback(null, user);
        } else {
          console.log("Not found " + username);
          callback(null, null);
        }
      });
    },
    findOne: function(username, callback) {
      let me = this;
      console.log('findOne');

      db.get('select oid as _id, * from users where username = ?', [username], function(err, row) {
        if (err) {
          console.log('ERROR');
          throw err;
        }
        if (row) {
          console.log(`Found ${username} ${row}`);
          callback(null, me.make(row));
        } else {
          console.log("Not found " + username);
          callback(null, null);
        }
      });
    },
    findById: function(id, callback) {
      let me = this;
      console.log("findById");

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
