var fs = require('node-fs');

module.exports = {
  get: function(db, type, id, callback) {
    var path = [db, type].join('/'),
        file = [path, id].join('/') + '.json';

    fs.exists(path, function(exists) {
      if (exists) {
        fs.readFile(file, 'utf8', function(err, data) {
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

    fs.mkdir(path, 0777, true, function(err1) {
      fs.writeFile(file, data, 'utf8', function(err) {
        callback(err, !err);
      });
    });
  },

  del: function(db, type, id, callback) {
    var path = [db, type].join('/'),
        file = [path, id].join('/') + '.json';

    fs.exists(path, function(exists) {
      if (exists) {
        fs.unlink(file, function(err) {
          callback(err, true);
        });
      } else {
        callback(null, false);
      }
    });
  },

  exists: function(db, type, id, callback) {
    var path = [db, type].join('/');

    fs.exists(path, function(exists) {
      callback(err, exists);
    });
  }
};
