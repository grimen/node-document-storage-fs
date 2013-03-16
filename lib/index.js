require('sugar');
var util = require('util'),
    path = require('path');

// HACK: ...until Node.js `require` supports `instanceof` on modules loaded more than once. (bug in Node.js)
var Storage = global.NodeDocumentStorage || (global.NodeDocumentStorage = require('node-document-storage'));

// -----------------------
//  DOCS
// --------------------
//  - http://nodejs.org/api/fs.html
//  - https://github.com/bpedro/node-fs

// -----------------------
//  TODO
// --------------------
//  - fs://localhost:1234/tmp/{db}-{env}  =>  write file via SCP

// -----------------------
//  Constructor
// --------------------

// new FS ();
// new FS (options);
// new FS (url);
// new FS (url, options);
function FS () {
  var self = this;

  self.klass = FS;
  self.klass.super_.apply(self, arguments);
}

util.inherits(FS, Storage);

// -----------------------
//  Class
// --------------------

FS.id = 'fs';
FS.protocol = 'file';

FS.defaults = FS.defaults || {};
FS.defaults.url = Storage.env('FS_URL') || 'file:///tmp/{db}-{env}'.assign({
  db: 'default',
  env: process.env.NODE_ENV || 'development'
});
FS.defaults.options = {
  server: {
    extension: '.json' // REVIEW: Move into connection URL?
  },
  client: {
    encoding: 'utf8',
    mode: 0777
  }
};

FS.url = FS.defaults.url;
FS.options = FS.defaults.options;

FS.reset = Storage.reset;

// -----------------------
//  Instance
// --------------------

// #connect ()
FS.prototype.connect = function() {
  var self = this;

  self._connect(function() {
    var fs = require('node-fs');

    self.client = fs;

    self.client.mkdir(self.options.server.db, self.options.client.mode, true, function (err) {
      self.emit('ready', err);
    });
  });
};

// #set (key, value, [options], callback)
// #set (keys, values, [options], callback)
FS.prototype.set = function() {
  var self = this;

  self._set(arguments, function(key_values, options, done, next) {
    key_values.each(function(key, value) {
      var _key = self.resource(key).path + self.resource(key).ext;

      self.client.mkdir(path.dirname(_key), self.options.client.mode, true, function() {
        self.client.writeFile(_key, value, self.options.client.encoding, function(err, response) {
          next(key, err, !err, response);
        });
      });
    });
  });
};

// #get (key, [options], callback)
// #get (keys, [options], callback)
FS.prototype.get = function() {
  var self = this;

  self._get(arguments, function(keys, options, done, next) {
    keys.each(function(key) {
      var _key = self.resource(key).path + self.resource(key).ext;

      self.client.readFile(_key, self.options.client.encoding, function(err, response) {
        next(key, err, response, response);
      });
    });
  });
};

// #del (key, [options], callback)
// #del (keys, [options], callback)
FS.prototype.del = function() {
  var self = this;

  self._del(arguments, function(keys, options, done, next) {
    keys.each(function(key) {
      var _key = self.resource(key).path + self.resource(key).ext;

      self.client.exists(_key, function(exists) {
        if (exists) {
          self.client.unlink(_key, function(err) {
            next(key, err, !err, null);
          });
        } else {
          next(key, null, false, null);
        }
      });
    });
  });
};

// #exists (key, [options], callback)
// #exists (keys, [options], callback)
FS.prototype.exists = function() {
  var self = this;

  self._exists(arguments, function(keys, options, done, next) {
    keys.each(function(key) {
      var _key = self.resource(key).path + self.resource(key).ext;

      self.client.exists(_key, function(response) {
        next(key, null, !!response, response);
      });
    });
  });
};

// #pack ()
FS.prototype.pack = JSON.stringify;

// #unpack ()
FS.prototype.unpack = JSON.parse;

// -----------------------
//  Export
// --------------------

module.exports = FS;
