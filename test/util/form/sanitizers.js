'use strict';

var assert = require('assert');

var whitespace = require('../../../src/util/form/constants').whitespace;
var GiveAndExpect = require('../../test-helper');

var sanitizers = require('../../../src/util/form/sanitizers');

describe('sanitizers', () => {
  describe('strip', () => {
    let give = new GiveAndExpect(sanitizers.strip);

    it('should return empty string when str is only whitespace.',
      give(whitespace).expect(''));

    it('should return stripped string when str contains whitespace at the end of str.',
      give('foo' + whitespace).expect('foo'));

    it('should return stripped string when str contains whitespace at the beginning of str.',
      give(whitespace + 'foo').expect('foo'));

    it('should return stripped string when str contains whitespace at the beginning and end of str.',
      give(whitespace + 'foo' + whitespace).expect('foo'));

    it('should return unmodified string when str does not contains whitespace at the beginning and end of str.',
      give('foo').expect('foo'));
  });

  describe('toBoolean', () => {
    let give = new GiveAndExpect(sanitizers.toBoolean);

    it('should throw Error hen the str is neither true nor false.', () => {
      assert.throws(() => sanitizers.toBoolean('foo'));
    });

    it('should return true when str is true.', give('true').expect(true));

    it('should return false when str is false.', give('false').expect(false));
  });

  describe('toNumber', () => {
    let give = new GiveAndExpect(sanitizers.toNumber);

    it('should return NaN when str is not numeric value.', () => {
      assert(isNaN(sanitizers.toNumber('foo')));
    });

    it('should return 0 when str is null.',
      give(null).expect(0));

    it('should return correct number when str is negative numeric value.',
      give('-1').expect(-1));

    it('should return 0 when str is 0.',
      give('0').expect(0));

    it('should return correct number when str is positive numeric value.',
      give('1').expect(1));
  });
});