'use strict';

var settings = require('../settings');
var util = require('util');
var request = require('request');
var assert = require('power-assert').customize({
  output: {
    maxDepth: 3
  }
});

var url = 'http://' + settings.app.host + ':' + settings.app.port;

/**
 *
 * @param {string} method
 * @param {string} path
 * @param {!Object}params
 * @returns {{expect: Function}}
 */
module.exports.req = function (method, path, params) {
  return {
    /**
     *
     * @param {number} statusCode
     * @param {Object} body
     * @param {Function} done
     */
    expect: function (statusCode, body, done) {
      request({
        method: method,
        url: url + path,
        form: params,
        json: true
      }, function (err, res, resBody) {
        if (err) {
          done();
        }

        assert(res.statusCode === statusCode);
        assert.deepEqual(resBody, body);

        done();
      });
    }
  };
};

/**
 *
 * @param {!number} length
 */
module.exports.dummyString = function (length) {
  if (!util.isNumber(length) || length < 0) {
    throw new Error('Invalid length');
  }

  let dummy = '';
  for (let i = 0; i < length; i++) {
    dummy += 'a';
  }

  return dummy;
};
