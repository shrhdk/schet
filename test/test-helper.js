'use strict';

var settings = require('../src/settings');
var util = require('util');
var request = require('request');
var assert = require('power-assert').customize({
  output: {
    maxDepth: 3
  }
});

var url = 'http://' + settings.app.host + ':' + settings.app.port;

class Req {
  /**
   *
   * @param {string} method
   * @param {string} path
   * @param {!Object}params
   * @returns {{expect: Function}}
   */
  constructor(method, path, params) {
    this.method = method;
    this.path = path;
    this.params = params;
  }

  expect(statusCode, body, done) {
    request({
      method: this.method,
      url: url + this.path,
      form: this.params,
      json: true
    }, (err, res, resBody) => {
      if (err) {
        done(err);
      }

      assert(res.statusCode === statusCode);
      assert.deepEqual(resBody, body);

      done();
    });
  }
}

exports.req = (method, path, params) => new Req(method, path, params);

/**
 *
 * @param {!number} length
 */
module.exports.dummyString = function (length) {
  assert(1 <= length);

  let dummy = '';
  for (let i = 0; i < length; i++) {
    dummy += 'a';
  }

  return dummy;
};
