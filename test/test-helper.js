'use strict';

var settings = require('../src/settings');

var assert = require('assert');
var util = require('util');
var request = require('request');

const URL = `http://${settings.app.host}:${settings.app.port}`;

export class GiveAndExpect {
  constructor(fn) {
    this.fn = fn;
  }

  give(given) {
    return {
      expect(expected) {
        return () => {
          let actual = fn(given);
          assert.strictEqual(actual, expected);
        };
      }
    }
  }
}

export class Req {
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
      url: URL + this.path,
      form: this.params,
      json: true
    }, (err, res, resBody) => {
      if (err) {
        return done(err);
      }

      assert.strictEqual(res.statusCode, statusCode);
      assert.deepEqual(resBody, body);

      return done();
    });
  }
}

exports.req = function (method, path, params) {
  return new Req(method, path, params);
};

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
