/*eslint no-underscore-dangle:0*/

var settings = require('../../settings');
var errors = require('../errors');
var async = require('async');
var mongodb = require('mongodb');
var util = require('util');

/**
 * obj.id = obj._id; delete obj._id; return obj;
 * @param {!Object} obj
 * @returns {Object}
 */
var replaceId = function (obj) {
  'use strict';

  obj.id = obj._id;
  delete obj._id;

  return obj;
};

/**
 * Open DB
 * @param {function(Error, Db)} cb
 */
var openDB = function (cb) {
  'use strict';

  var server = new mongodb.Server(settings.mongo.host, settings.mongo.port);
  var db = new mongodb.Db(settings.mongo.db, server, {safe: true});

  return db.open(cb);
};

/**
 * Open Collection
 * @param {!string} collectionName
 * @param {!function(Error, Collection, function(function(Error, *)))} cb
 */
var openCollection = function (collectionName, cb) {
  'use strict';

  return openDB(function (err, db) {
    if (err) {
      return cb(err, null, null);
    }

    return db.collection(collectionName, function (err, collection) {
      if (err) {
        return db.close(function () {
          return cb(err, null, null);
        });
      }

      var close = function (cb) {
        db.close(cb);
      };

      return cb(null, collection, close);
    });
  });
};

/**
 * Get current sequence number
 * @param {!string} collectionName
 * @param {!function(Error, number)} cb
 */
var seq = function (collectionName, cb) {
  'use strict';

  return openCollection('counters', function (err, counters, close) {
    if (err) {
      return cb(err, null);
    }

    return counters.findOne({_id: collectionName}, function (err, doc) {
      close();

      if (err) {
        return cb(err, null);
      }

      return cb(null, doc.seq);
    });
  });
};

/**
 * Get next sequence number and increment
 * @param {!string} collectionName
 * @param {!function(Error, number)} cb
 */
var nextSeq = function (collectionName, cb) {
  'use strict';

  return openCollection('counters', function (err, counters, close) {
    if (err) {
      return cb(err, null);
    }

    var query = {_id: collectionName};
    var sort = [];
    var update = {$inc: {seq: 1}};
    var opts = {new: true};

    return counters.findAndModify(query, sort, update, opts, function (err, doc) {
      close();

      if (err) {
        return cb(err, null);
      }

      return cb(null, doc.seq);
    });
  });
};

/**
 * Init DB with data
 * @param {!Object.<String, Array.<Object>>} data - {collectionName1: [document, ...], collectionName2: [document, ...], ...}
 * @param {!function(Error)} cb
 */
exports.init = function (data, cb) {
  'use strict';

  return openDB(function (err, db) {
    if (err) {
      return cb(err);
    }

    var tasks = [];

    tasks.push(function (next) {
      db.dropDatabase(function (err, db) {
        if (err) {
          return db.close(function () {
            return next(err, null);
          });
        }

        return next(null, db);
      });
    });

    Object.keys(data).forEach(function (collectionName) {
      tasks.push(function (next) {
        db.collection(collectionName, function (err, collection) {
          var docs = data[collectionName];

          if (err) {
            return db.close(function () {
              return next(err, null);
            });
          }

          docs.forEach(function (value) {
            value._id = value.id;
            delete value.id;
          });

          collection.insert(docs, function (err, result) {
            if (err) {
              return db.close(function () {
                return next(err, null);
              });
            }

            return next(null, result);
          });
        });
      });
    });

    return async.series(tasks, function (err) {
      return db.close(function () {
        if (cb) {
          return cb(err);
        }
      });
    });
  });
};

/**
 * Create new document which is set sequential number to ID
 * @param {!string} collectionName
 * @param {!Object} data - object to write to DB.
 * @param {!function(Error, Object)} cb - result is data + property 'id'.
 */
exports.create = function (collectionName, data, cb) {
  'use strict';

  return nextSeq(collectionName, function (err, seq) {
    if (err) {
      return cb(err, null);
    }

    return openCollection(collectionName, function (err, collection, close) {
      if (err) {
        return cb(err, null);
      }

      data._id = seq;

      return collection.insert(data, function (err, docs) {
        return close(function () {
          if (err) {
            return cb(err, null);
          }

          var doc = docs[0];
          replaceId(doc);

          return cb(null, doc);
        });
      });
    });
  });
};

/**
 * Read the document which has specific ID
 * @param {!string} collectionName
 * @param {!number} id
 * @param {!function(Error, Object)} cb
 */
exports.read = function (collectionName, id, cb) {
  'use strict';

  id = Number(id);

  return seq(collectionName, function (err, seq) {
    if (err) {
      return cb(err, null);
    }

    if (id < 1 || seq < id) {
      return cb(new errors.NotFoundError(), null);
    }

    return openCollection(collectionName, function (err, collection, close) {
      if (err) {
        return cb(err, null);
      }

      return collection.findOne({_id: id}, function (err, doc) {
        return close(function () {
          if (err) {
            return cb(err, null);
          }

          if (doc === null) {
            return cb(new errors.NotFoundError(true), null);
          }

          replaceId(doc);
          return cb(null, doc);
        });
      });
    });
  });
};

/**
 * Update the document which has specific ID
 * @param {!string} collectionName
 * @param {!number} id
 * @param {!string} operator - MongoDB Update Operators
 * @param {!Object} data
 * @param {!function(Error, Object)} cb
 * @see http://docs.mongodb.org/manual/reference/operator/update/
 */
exports.update = function (collectionName, id, operator, data, cb) {
  'use strict';

  id = Number(id);

  if (Object.keys(data).length === 0) {
    // No need to modify
    return exports.read(collectionName, id, cb);
  }

  return seq(collectionName, function (err, seq) {
    if (err) {
      return cb(err, null);
    }

    if (id < 1 || seq < id) {
      return cb(new errors.NotFoundError(), null);
    }

    return openCollection(collectionName, function (err, collection, close) {
      if (err) {
        return cb(err, null);
      }

      var query = {_id: id};
      var sort = [];
      var update = {};
      update[operator] = data;
      var opts = {new: true};

      return collection.findAndModify(query, sort, update, opts, function (err, modified) {
        return close(function () {
          if (err) {
            return cb(err, null);
          }

          if (modified == null) {
            return cb(new errors.NotFoundError(true), null);
          }

          replaceId(modified);

          return cb(null, modified);
        });
      });
    });
  });
};

/**
 * Set data to the document which has specific ID
 * @param {!string} collectionName
 * @param {!number} id
 * @param {!Object} data
 * @param {!function(Error, Object)} cb
 */
exports.set = function (collectionName, id, data, cb) {
  'use strict';

  id = Number(id);

  return exports.update(collectionName, id, '$set', data, cb);
};

/**
 * Unset specific keys from the document which has specific ID
 * @param {!string} collectionName
 * @param {!number} id
 * @param {!string || Array.<string>} keys - key name or names to remove from doc.
 * @param {!function(Error, Object)} cb
 */
exports.unset = function (collectionName, id, keys, cb) {
  'use strict';

  id = Number(id);

  if (util.isString(keys)) {
    keys = [keys];
  }

  if (!util.isArray(keys)) {
    return cb(new errors.InvalidParameterError(), null);
  }

  var data = {};
  keys.forEach(function (key) {
    data[key] = '';
  });

  return exports.update(collectionName, id, '$unset', data, cb);
};

/**
 * Delete the document which has specific ID
 * @param {!string} collectionName
 * @param {!number} id
 * @param {!function(Error)} cb
 */
exports.delete = function (collectionName, id, cb) {
  'use strict';

  id = Number(id);

  return seq(collectionName, function (err, seq) {
    if (err) {
      return cb(err);
    }

    if (id < 1 || seq < id) {
      return cb(new errors.NotFoundError());
    }

    return openCollection(collectionName, function (err, collection, close) {
      if (err) {
        return cb(err);
      }

      return collection.remove({_id: id}, function (err) {
        return close(function () {
          if (err) {
            return cb(err);
          }

          return cb(null);
        });
      });
    });
  });
};
