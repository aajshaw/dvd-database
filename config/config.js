"use strict"

const nconf = require('nconf');

nconf.file('config.json');

module.exports = {
  get: function(key) {
    return nconf.get(key);
  }
};
