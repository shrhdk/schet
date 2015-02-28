'use strict';

var assert = require('power-assert');

var whitespace = require('../../../src/util/form/constants').whitespace;
var sanitizers = require('../../../src/util/form/sanitizers');

describe('sanitizers', function () {
  describe('strip', function () {
    it('should return empty string when str is only whitespace.', function () {
      let actual = sanitizers.strip(whitespace);
      let expected = '';

      assert(actual === expected);
    });

    it('should return stripped string when str contains whitespace at the end of str.', function () {
      let actual = sanitizers.strip('foo' + whitespace);
      let expected = 'foo';

      assert(actual === expected);
    });

    it('should return stripped string when str contains whitespace at the beginning of str.', function () {
      let actual = sanitizers.strip(whitespace + 'foo');
      let expected = 'foo';

      assert(actual === expected);
    });

    it('should return stripped string when str contains whitespace at the beginning and end of str.', function () {
      let actual = sanitizers.strip(whitespace + 'foo' + whitespace);
      let expected = 'foo';

      assert(actual === expected);
    });

    it('should return unmodified string when str does not contains whitespace at the beginning and end of str.', function () {
      let actual = sanitizers.strip('foo');
      let expected = 'foo';

      assert(actual === expected);
    });
  });

  describe('toBoolean', function () {
    it('should throw Error hen the str is neither true nor false.', function () {
      assert.throws(function () {
        sanitizers.toBoolean('foo');
      });
    });

    it('should return true when str is true.', function () {
      let actual = sanitizers.toBoolean('true');
      let expected = true;

      assert(actual === expected);
    });

    it('should return false when str is false.', function () {
      let actual = sanitizers.toBoolean('false');
      let expected = false;

      assert(actual === expected);
    });
  });

  describe('toNumber', function () {
    it('should return NaN when str is not numeric value.', function () {
      let actual = sanitizers.toNumber('foo');

      assert(isNaN(actual));
    });

    it('should return 0 when str is null.', function () {
      let actual = sanitizers.toNumber(null);
      let expected = 0;

      assert(actual === expected);
    });

    it('should return correct number when str is negative numeric value.', function () {
      let actual = sanitizers.toNumber('-1');
      let expected = -1;

      assert(actual === expected);
    });

    it('should return 0 when str is 0.', function () {
      let actual = sanitizers.toNumber('0');
      let expected = 0;

      assert(actual === expected);
    });

    it('should return correct number when str is positive numeric value.', function () {
      let actual = sanitizers.toNumber('1');
      let expected = 1;

      assert(actual === expected);
    });
  });
});