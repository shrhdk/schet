'use strict';

var assert = require('assert');

var whitespace = require('../../../src/util/form/constants').whitespace;
var GiveAndExpect = require('../../test-helper').GiveAndExpect;

var sanitizers = require('../../../src/util/form/sanitizers');

describe('sanitizers', () => {
  describe('strip', () => {
    let test = new GiveAndExpect(sanitizers.strip);

    it('should return empty string when str is only whitespace.',
      test.give(whitespace).expect(''));

    it('should return stripped string when str contains whitespace at the end of str.',
      test.give('foo' + whitespace).expect('foo'));

    it('should return stripped string when str contains whitespace at the beginning of str.',
      test.give(whitespace + 'foo').expect('foo'));

    it('should return stripped string when str contains whitespace at the beginning and end of str.',
      test.give(whitespace + 'foo' + whitespace).expect('foo'));

    it('should return unmodified string when str does not contains whitespace at the beginning and end of str.',
      test.give('foo').expect('foo'));
  });

  describe('toBoolean', () => {
    let test = new GiveAndExpect(sanitizers.toBoolean);

    it('should throw Error hen the str is neither true nor false.', () => {
      assert.throws(() => sanitizers.toBoolean('foo'));
    });

    it('should return true when str is true.', test.give('true').expect(true));

    it('should return false when str is false.', test.give('false').expect(false));
  });

  describe('toNumber', () => {
    let test = new GiveAndExpect(sanitizers.toNumber);

    it('should return NaN when str is not numeric value.', () => {
      assert(isNaN(sanitizers.toNumber('foo')));
    });

    it('should return 0 when str is null.',
      test.give(null).expect(0));

    it('should return correct number when str is negative numeric value.',
      test.give('-1').expect(-1));

    it('should return 0 when str is 0.',
      test.give('0').expect(0));

    it('should return correct number when str is positive numeric value.',
      test.give('1').expect(1));
  });
});