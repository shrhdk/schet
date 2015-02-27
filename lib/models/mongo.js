/*eslint no-underscore-dangle:0*/

'use strict';

var settings = require('../../settings');
var ERRORS = require('../errors');
var async = require('async');
var mongodb = require('mongodb');
var util = require('util');

/**
 * obj.id = obj._id; delete obj._id; return obj;
 * @param {!Object} obj
 * @returns {Object}
 */
var replaceID = (obj) => {
  obj.id = obj._id;
  delete obj._id;

  return obj;
};

/**
 * Open DB
 * @param {function(Error, Db)} cb
 */
var openDB = (cb) => {
  const server = new mongodb.Server(settings.mongo.host, settings.mongo.port);
  const db = new mongodb.Db(settings.mongo.db, server, {safe: true});

  return db.open(cb);
};

/**
 * Open Collection
 * @param {!string} collectionName
 * @param {!function(Error, Collection, function(function(Error, *)))} cb
 */
var openCollection = (collectionName, cb) => {
  return openDB((err, db) => {
    if (err) {
      return cb(err);
    }

    return db.collection(collectionName, (err, collection) => {
      if (err) {
        return db.close(() => {
          return cb(err);
        });
      }

      const close = (cb) => {
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
var seq = (collectionName, cb) => {
  return openCollection('counters', (err, counters, close) => {
    if (err) {
      return cb(err);
    }

    return counters.findOne({_id: collectionName}, (err, doc) => {
      close();

      if (err) {
        return cb(err);
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
var nextSeq = (collectionName, cb) => {
  return openCollection('counters', (err, counters, close) => {
    if (err) {
      return cb(err);
    }

    const query = {_id: collectionName};
    const sort = [];
    const update = {$inc: {seq: 1}};
    const opts = {new: true};

    return counters.findAndModify(query, sort, update, opts, (err, doc) => {
      close();

      if (err) {
        return cb(err);
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
exports.init = (data, cb) => {
  return openDB((err, db) => {
    if (err) {
      return cb(err);
    }

    const tasks = [];

    tasks.push((next) => {
      db.dropDatabase((err, db) => {
        if (err) {
          return db.close(() => {
            return next(err);
          });
        }

        return next(null, db);
      });
    });

    Object.keys(data).forEach((collectionName) => {
      tasks.push((next) => {
        db.collection(collectionName, (err, collection) => {
          const docs = data[collectionName];

          if (err) {
            return db.close(() => {
              return next(err);
            });
          }

          docs.forEach((value) => {
            value._id = value.id;
            delete value.id;
          });

          collection.insert(docs, (err, result) => {
            if (err) {
              return db.close(() => {
                return next(err);
              });
            }

            return next(null, result);
          });
        });
      });
    });

    return async.series(tasks, (err) => {
      return db.close(() => {
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
exports.create = (collectionName, data, cb) => {
  return nextSeq(collectionName, (err, seq) => {
    if (err) {
      return cb(err);
    }

    return openCollection(collectionName, (err, collection, close) => {
      if (err) {
        return cb(err);
      }

      data._id = seq;

      return collection.insert(data, (err, docs) => {
        if (err) {
          return cb(err);
        }

        return close(() => {
          if (err) {
            return cb(err);
          }

          return cb(null, replaceID(docs[0]));
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
exports.read = (collectionName, id, cb) => {
  id = Number(id);

  return seq(collectionName, (err, seq) => {
    if (err) {
      return cb(err);
    }

    if (id < 1 || seq < id) {
      return cb(ERRORS.NOT_FOUND_ERROR, null);
    }

    return openCollection(collectionName, (err, collection, close) => {
      if (err) {
        return cb(err);
      }

      return collection.findOne({_id: id}, (err, doc) => {
        return close(() => {
          if (err) {
            return cb(err);
          }

          if (doc === null) {
            return cb(ERRORS.NOT_FOUND_ERROR, null);
          }

          return cb(null, replaceID(doc));
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
exports.update = (collectionName, id, operator, data, cb) => {
  id = Number(id);

  if (Object.keys(data).length === 0) {
    // No need to modify
    return exports.read(collectionName, id, cb);
  }

  return seq(collectionName, (err, seq) => {
    if (err) {
      return cb(err);
    }

    if (id < 1 || seq < id) {
      return cb(ERRORS.NOT_FOUND_ERROR, null);
    }

    return openCollection(collectionName, (err, collection, close) => {
      if (err) {
        return cb(err);
      }

      const query = {_id: id};
      const sort = [];
      const update = {};
      update[operator] = data;
      const opts = {new: true};

      return collection.findAndModify(query, sort, update, opts, (err, modified) => {
        return close(() => {
          if (err) {
            return cb(err);
          }

          if (modified == null) {
            return cb(ERRORS.NOT_FOUND_ERROR, null);
          }

          return cb(null, replaceID(modified));
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
exports.set = (collectionName, id, data, cb) => {
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
exports.unset = (collectionName, id, keys, cb) => {
  id = Number(id);

  if (util.isString(keys)) {
    keys = [keys];
  }

  if (!util.isArray(keys)) {
    return cb(ERRORS.INVALID_PARAMETER_ERROR, null);
  }

  const data = {};
  keys.forEach((key) => {
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
exports.delete = (collectionName, id, cb) => {
  id = Number(id);

  return seq(collectionName, (err, seq) => {
    if (err) {
      return cb(err);
    }

    if (id < 1 || seq < id) {
      return cb(ERRORS.NOT_FOUND_ERROR);
    }

    return openCollection(collectionName, (err, collection, close) => {
      if (err) {
        return cb(err);
      }

      return collection.remove({_id: id}, (err) => {
        return close(() => {
          if (err) {
            return cb(err);
          }

          return cb();
        });
      });
    });
  });
};
