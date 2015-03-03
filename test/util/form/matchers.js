'use strict';

var assert = require('assert');

var whitespace = require('../../../src/util/form/constants').whitespace;
var matchers = require('../../../src/util/form/matchers');

describe('matchers', () => {
  describe('str', () => {
    it('("foo") should return true when value is "foo"', () => {
      let m = matchers.str('foo');

      assert.strictEqual(m('foo'), true);
      assert.strictEqual(m('bar'), false);
    });
  });

  describe('re', () => {
    it('(/^\d+$/) should return true when value is "foo"', () => {
      let m = matchers.re(/^\d+$/);

      assert.strictEqual(m('1'), true);
      assert.strictEqual(m('12'), true);
      assert.strictEqual(m('12 '), false);
      assert.strictEqual(m(' 12'), false);
      assert.strictEqual(m(''), false);
      assert.strictEqual(m('foo'), false);
    });
  });

  describe('ge', () => {
    it('(-1) should return true when value is greater than or equal to -1.', () => {
      let m = matchers.ge(-1);

      assert.strictEqual(m(-2), false);
      assert.strictEqual(m(-1), true);
      assert.strictEqual(m(+0), true);
      assert.strictEqual(m(+1), true);
    });

    it('(0) should return true when value is greater than or equal to 0.', () => {
      let m = matchers.ge(0);

      assert.strictEqual(m(-1), false);
      assert.strictEqual(m(+0), true);
      assert.strictEqual(m(+1), true);
    });

    it('(1) should return true when value is greater than or equal to 1.', () => {
      let m = matchers.ge(1);

      assert.strictEqual(m(-1), false);
      assert.strictEqual(m(+0), false);
      assert.strictEqual(m(+1), true);
      assert.strictEqual(m(+2), true);
    });
  });
});
