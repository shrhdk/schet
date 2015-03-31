'use strict';

var assert = require('assert');
var util = require('util');
var request = require('request');

const URL = `http://127.0.0.1:${process.env.PORT || 3000}`;

class Expect {
  constructor(actual) {
    this.actual = actual;
  }

  expect(expected) {
    return () => {
      assert.strictEqual(this.actual, expected);
    };
  }
}

export class GiveAndExpect {
  constructor(fn) {
    this.fn = fn;
  }

  give() {
    return new Expect(this.fn.apply(this, arguments));
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
 * length = 3 -> 'aaa'
 *
 * @param {!number} length
 */
module.exports.dummyString = function (length) {
  assert(1 <= length);

  return new Array(length + 1).join('a').toString();
};
