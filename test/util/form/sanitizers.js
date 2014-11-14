/*eslint strict:0*/

var assert = require('power-assert');

var whitespace = require('../../../lib/util/form/constants').whitespace;
var sanitizers = require('../../../lib/util/form/sanitizers');

describe('sanitizers', function () {
    describe('strip', function () {
        it('should return empty string when str is only whitespace.', function () {
            var actual = sanitizers.strip(whitespace);
            var expected = '';

            assert(actual === expected);
        });

        it('should return stripped string when str contains whitespace at the end of str.', function () {
            var actual = sanitizers.strip('foo' + whitespace);
            var expected = 'foo';

            assert(actual === expected);
        });

        it('should return stripped string when str contains whitespace at the beginning of str.', function () {
            var actual = sanitizers.strip(whitespace + 'foo');
            var expected = 'foo';

            assert(actual === expected);
        });

        it('should return stripped string when str contains whitespace at the beginning and end of str.', function () {
            var actual = sanitizers.strip(whitespace + 'foo' + whitespace);
            var expected = 'foo';

            assert(actual === expected);
        });

        it('should return unmodified string when str does not contains whitespace at the beginning and end of str.', function () {
            var actual = sanitizers.strip('foo');
            var expected = 'foo';

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
            var actual = sanitizers.toBoolean('true');
            var expected = true;

            assert(actual === expected);
        });

        it('should return false when str is false.', function () {
            var actual = sanitizers.toBoolean('false');
            var expected = false;

            assert(actual === expected);
        });
    });

    describe('toNumber', function () {
        it('should return NaN when str is not numeric value.', function () {
            var actual = sanitizers.toNumber('foo');

            assert(isNaN(actual));
        });

        it('should return 0 when str is null.', function () {
            var actual = sanitizers.toNumber(null);
            var expected = 0;

            assert(actual === expected);
        });

        it('should return correct number when str is negative numeric value.', function () {
            var actual = sanitizers.toNumber('-1');
            var expected = -1;

            assert(actual === expected);
        });

        it('should return 0 when str is 0.', function () {
            var actual = sanitizers.toNumber('0');
            var expected = 0;

            assert(actual === expected);
        });

        it('should return correct number when str is positive numeric value.', function () {
            var actual = sanitizers.toNumber('1');
            var expected = 1;

            assert(actual === expected);
        });
    });
});