'use strict';

var assert = require('power-assert');

var whitespace = require('../../../src/util/form/constants').whitespace;
var matchers = require('../../../src/util/form/matchers');

describe('matchers', () => {
  describe('str', () => {
    it('("foo") should return true when value is "foo"', () => {
      let m = matchers.str('foo');

      assert(m('foo') === true);
      assert(m('bar') === false);
    });
  });

  describe('re', () => {
    it('(/^\d+$/) should return true when value is "foo"', () => {
      let m = matchers.re(/^\d+$/);

      assert(m('1') === true);
      assert(m('12') === true);
      assert(m('12 ') === false);
      assert(m(' 12') === false);
      assert(m('') === false);
      assert(m('foo') === false);
    });
  });

  describe('ge', () => {
    it('(-1) should return true when value is greater than or equal to -1.', () => {
      let m = matchers.ge(-1);

      assert(m(-2) === false);
      assert(m(-1) === true);
      assert(m(+0) === true);
      assert(m(+1) === true);
    });

    it('(0) should return true when value is greater than or equal to 0.', () => {
      let m = matchers.ge(0);

      assert(m(-1) === false);
      assert(m(+0) === true);
      assert(m(+1) === true);
    });

    it('(1) should return true when value is greater than or equal to 1.', () => {
      let m = matchers.ge(1);

      assert(m(-1) === false);
      assert(m(+0) === false);
      assert(m(+1) === true);
      assert(m(+2) === true);
    });
  });
});