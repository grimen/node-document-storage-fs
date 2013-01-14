
// -----------------------
//  Test
// --------------------

var Storage = require('../../node-document-storage');

module.exports = Storage.Spec('FS', {
  module: require('..'),
  engine: require('node-fs'),
  db: '/tmp/default-test',
  default_url: 'file:///tmp/default-test',
  authorized_url: undefined,
  unauthorized_url: undefined,
  client: {
    get: function(db, type, id, callback) {
      var path = [db, type].join('/'),
          file = [path, id].join('/') + '.json';

      require('node-fs').exists(path, function(exists) {
        if (exists) {
          require('node-fs').readFile(file, 'utf8', function(err, data) {
            callback(err, data || null);
          });
        } else {
          callback(null, null);
        }
      });
    },

    set: function(db, type, id, data, callback) {
      var path = [db, type].join('/'),
          file = [path, id].join('/') + '.json';

      require('node-fs').mkdir(path, 0777, true, function(err1) {
        require('node-fs').writeFile(file, data, 'utf8', function(err) {
          callback(err, !err);
        });
      });
    },

    del: function(db, type, id, callback) {
      var path = [db, type].join('/'),
          file = [path, id].join('/') + '.json';

      require('node-fs').exists(path, function(exists) {
        if (exists) {
          require('node-fs').unlink(file, function(err) {
            callback(err, true);
          });
        } else {
          callback(null, false);
        }
      });
    },

    exists: function(db, type, id, callback) {
      var path = [db, type].join('/');

      require('node-fs').exists(path, function(exists) {
        callback(err, exists);
      });
    }
  }
});
