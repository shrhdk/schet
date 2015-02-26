/*eslint strict:0*/

var assert = require('power-assert');

var whitespace = require('../../../lib/util/form/constants').whitespace;
var validators = require('../../../lib/util/form/validators');

describe('validators', function () {
  describe('isNotWhitespace', function () {
    it('should return true when str is empty.', function () {
      var actual = validators.isNotWhitespace('');
      var expected = false;

      assert(actual === expected);
    });

    it('should return true when str is whitespace.', function () {
      var actual = validators.isNotWhitespace(whitespace);
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str includes non whitespace.', function () {
      var actual = validators.isNotWhitespace(whitespace + 'foo');
      var expected = true;

      assert(actual === expected);
    });

    it('should return false when str includes non whitespace.', function () {
      var actual = validators.isNotWhitespace('foo' + whitespace);
      var expected = true;

      assert(actual === expected);
    });
  });

  describe('isOneLine', function () {
    it('should return false when str contains \\n', function () {
      var actual = validators.isOneLine('hello\nworld');
      var expected = false;

      assert(actual === expected);
    });
    it('should return false when str contains \\r', function () {
      var actual = validators.isOneLine('hello\rworld');
      var expected = false;

      assert(actual === expected);
    });
    it('should return false when str contains \\r\\n', function () {
      var actual = validators.isOneLine('hello\r\nworld');
      var expected = false;

      assert(actual === expected);
    });

    it('should return true when str does not contains new line', function () {
      var actual = validators.isOneLine('hello world');
      var expected = true;

      assert(actual === expected);
    });
  });

  describe('list', function () {
    it('with no params should throws Error', function () {
      assert.throws(function () {
        validators.list();
      });
    });

    it('should return true when value is in list.', function () {
      var v = validators.list('foo', 'bar', 'baz');

      assert(v('foo') === true);
      assert(v('bar') === true);
      assert(v('baz') === true);
      assert(v('qux') === false);
    });
  });

  describe('ge', function () {
    it('(-1) should return true when value is greater than or equal to -1.', function () {
      var v = validators.ge(-1);

      assert(v(-2) === false);
      assert(v(-1) === true);
      assert(v(+0) === true);
      assert(v(+1) === true);
    });

    it('(0) should return true when value is greater than or equal to 0.', function () {
      var v = validators.ge(0);

      assert(v(-1) === false);
      assert(v(+0) === true);
      assert(v(+1) === true);
    });

    it('(1) should return true when value is greater than or equal to 1.', function () {
      var v = validators.ge(1);

      assert(v(-1) === false);
      assert(v(+0) === false);
      assert(v(+1) === true);
      assert(v(+2) === true);
    });
  });

  describe('range', function () {
    it('(1, -1) should throws Error', function () {
      assert.throws(function () {
        validators.range(1, -1);
      });
    });

    it('(-2, -1) should return true when (-2 <= value <= -1).', function () {
      var v = validators.range(-2, -1);

      assert(v(-3) === false);
      assert(v(-2) === true);
      assert(v(-1) === true);
      assert(v(+0) === false);
      assert(v(+1) === false);
    });

    it('(-1, 1) should return true when (-1 <= value <= 1).', function () {
      var v = validators.range(-1, 1);

      assert(v(-2) === false);
      assert(v(-1) === true);
      assert(v(+0) === true);
      assert(v(+1) === true);
      assert(v(+2) === false);
    });

    it('(1, 2) should return true when (1 <= value <= 2).', function () {
      var v = validators.range(1, 2);

      assert(v(-1) === false);
      assert(v(+0) === false);
      assert(v(+1) === true);
      assert(v(+2) === true);
      assert(v(+3) === false);
    });
  });

  describe('length', function () {
    it('(2, 1) should throws Error', function () {
      assert.throws(function () {
        validators.length(2, 1);
      });
    });

    it('(-1, 1) should throws Error', function () {
      assert.throws(function () {
        validators.length(-1, 1);
      });
    });

    it('(0, 0) should return true when (value.length == 0).', function () {
      var v = validators.length(0, 0);

      assert(v('') === true);
      assert(v('1') === false);
    });

    it('(0, 2) should return true when (0 <= value.length <= 2).', function () {
      var v = validators.length(0, 2);

      assert(v('') === true);
      assert(v('1') === true);
      assert(v('12') === true);
      assert(v('123') === false);
    });

    it('(1, 2) should return true when (1 <= value.length <= 2).', function () {
      var v = validators.length(1, 2);

      assert(v('') === false);
      assert(v('1') === true);
      assert(v('12') === true);
      assert(v('123') === false);
    });
  });

  describe('date', function () {
    it('should return false when str is wrong format.', function () {
      var actual = validators.isDateString('foo');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong year format.', function () {
      var actual = validators.isDateString('01234-01-01');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong month format.', function () {
      var actual = validators.isDateString('1970-012-01');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date format.', function () {
      var actual = validators.isDateString('1970-01-012');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date format with incorrect month.', function () {
      var actual = validators.isDateString('1970-00-01');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date format with incorrect month.', function () {
      var actual = validators.isDateString('1970-13-01');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date format with incorrect date.', function () {
      var actual = validators.isDateString('1970-01-00');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date format with incorrect date.', function () {
      var actual = validators.isDateString('1970-02-30');
      var expected = false;

      assert(actual === expected);
    });

    it('should return true when str is correct date format.', function () {
      var actual = validators.isDateString('1970-01-01');
      var expected = true;

      assert(actual === expected);
    });

    it('should return true when str is correct date format.', function () {
      var actual = validators.isDateString('1970-12-31');
      var expected = true;

      assert(actual === expected);
    });
  });

  describe('date range', function () {
    it('should return false when str is correct date range format with incorrect start month.', function () {
      var actual = validators.isDateString('1970-00-01/1970-01-01');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date range format with incorrect start date.', function () {
      var actual = validators.isDateString('1970-01-00/1970-03-01');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date range format with incorrect start date.', function () {
      var actual = validators.isDateString('1970-02-30/1970-03-01');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date range format with incorrect end month.', function () {
      var actual = validators.isDateString('1970-01-01/1970-13-01');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date range format with incorrect end date.', function () {
      var actual = validators.isDateString('1970-01-01/1970-02-00');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date range format with incorrect end date.', function () {
      var actual = validators.isDateString('1970-01-01/1970-02-30');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date range format but end date equals to start date.', function () {
      var actual = validators.isDateString('1970-01-01/1970-01-01');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date range format but end date earlier than start date.', function () {
      var actual = validators.isDateString('1970-01-02/1970-01-01');
      var expected = false;

      assert(actual === expected);
    });

    it('should return true when str is correct date range format.', function () {
      var actual = validators.isDateString('1970-01-01/1970-01-02');
      var expected = true;

      assert(actual === expected);
    });

    it('should return true when str is correct date range format.', function () {
      var actual = validators.isDateString('0000-01-01/9999-12-31');
      var expected = true;

      assert(actual === expected);
    });
  });

  describe('date time', function () {
    it('should return false when str is wrong date time format in year.', function () {
      var actual = validators.isDateString('01234-01-01T00:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in month.', function () {
      var actual = validators.isDateString('1970-012-01T00:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in date.', function () {
      var actual = validators.isDateString('1970-01-012T00:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in hours.', function () {
      var actual = validators.isDateString('1970-01-01T012:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in minutes.', function () {
      var actual = validators.isDateString('1970-01-01T00:012Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in minutes.', function () {
      var actual = validators.isDateString('1970-01-01T00:012Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect month.', function () {
      var actual = validators.isDateString('1970-00-01T00:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect month.', function () {
      var actual = validators.isDateString('1970-13-01T00:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect date.', function () {
      var actual = validators.isDateString('1970-01-00T00:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect date.', function () {
      var actual = validators.isDateString('1970-02-30T00:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect hours.', function () {
      var actual = validators.isDateString('1970-01-01T25:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect minutes.', function () {
      var actual = validators.isDateString('1970-01-01T00:60Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect time.', function () {
      var actual = validators.isDateString('1970-01-01T24:01Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return true when str is correct date time format.', function () {
      var actual = validators.isDateString('1970-01-01T00:00Z');
      var expected = true;

      assert(actual === expected);
    });

    it('should return true when str is correct date time format.', function () {
      var actual = validators.isDateString('1970-01-01T00:01Z');
      var expected = true;

      assert(actual === expected);
    });

    it('should return true when str is correct date time format.', function () {
      var actual = validators.isDateString('1970-01-01T23:59Z');
      var expected = true;

      assert(actual === expected);
    });

    it('should return true when str is correct date time format.', function () {
      var actual = validators.isDateString('1970-01-01T24:00Z');
      var expected = true;

      assert(actual === expected);
    });
  });

  describe('date time range', function () {
    // incorrect start format

    it('should return false when str is wrong date time format in start year.', function () {
      var actual = validators.isDateString('00000-01-01T00:00Z/0001-01-01T00:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in start month.', function () {
      var actual = validators.isDateString('1970-001-01T00:00Z/1970-01-02T00:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in start date.', function () {
      var actual = validators.isDateString('1970-01-001T00:00Z/1970-01-02T00:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in start hours.', function () {
      var actual = validators.isDateString('1970-01-01T000:00Z/1970-01-01T00:01Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in start minutes.', function () {
      var actual = validators.isDateString('1970-01-01T00:001Z/1970-01-01T00:02Z');
      var expected = false;

      assert(actual === expected);
    });

    // incorrect end format

    it('should return false when str is wrong date time format in end year.', function () {
      var actual = validators.isDateString('0000-01-01T00:00Z/00001-01-01T00:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in end month.', function () {
      var actual = validators.isDateString('1970-01-01T00:00Z/1970-001-02T00:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in end date.', function () {
      var actual = validators.isDateString('1970-01-01T01:00Z/1970-01-002T00:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in end hours.', function () {
      var actual = validators.isDateString('1970-01-01T00:00Z/1970-01-01T001:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is wrong date time format in end minutes.', function () {
      var actual = validators.isDateString('1970-01-01T00:00Z/1970-01-01T00:001Z');
      var expected = false;

      assert(actual === expected);
    });

    // incorrect start value

    it('should return false when str is correct date time format with incorrect start month.', function () {
      var actual = validators.isDateString('1970-00-01T00:00Z/1970-01-01T00:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect start date.', function () {
      var actual = validators.isDateString('1970-01-00T00:00Z/1970-01-01T00:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect start date.', function () {
      var actual = validators.isDateString('1970-02-30T00:00Z/1970-03-01T00:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect start hours.', function () {
      var actual = validators.isDateString('1970-01-01T25:00Z/1970-02-01T00:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect start minutes.', function () {
      var actual = validators.isDateString('1970-01-01T00:60Z/1970-01-02T00:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect start time.', function () {
      var actual = validators.isDateString('1970-01-01T24:01Z/1970-02-01T00:00Z');
      var expected = false;

      assert(actual === expected);
    });

    // incorrect end value

    it('should return false when str is correct date time format with incorrect end month.', function () {
      var actual = validators.isDateString('1970-01-01T00:00Z/1970-13-01T00:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect end date.', function () {
      var actual = validators.isDateString('1970-01-01T00:00Z/1970-02-00T00:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect end date.', function () {
      var actual = validators.isDateString('1970-02-01T00:00Z/1970-02-30T00:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect end hours.', function () {
      var actual = validators.isDateString('1970-01-01T00:00Z/1970-02-01T25:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect end minutes.', function () {
      var actual = validators.isDateString('1970-01-01T00:00Z/1970-01-01T00:60Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when str is correct date time format with incorrect end time.', function () {
      var actual = validators.isDateString('1970-01-01T00:00Z/1970-01-01T24:01Z');
      var expected = false;

      assert(actual === expected);
    });

    // incorrect value

    it('should return false when end time equals to start time.', function () {
      var actual = validators.isDateString('1970-01-01T00:00Z/1970-01-01T00:00Z');
      var expected = false;

      assert(actual === expected);
    });

    it('should return false when end time is earlier than start time.', function () {
      var actual = validators.isDateString('1970-01-01T00:01Z/1970-01-01T00:00Z');
      var expected = false;

      assert(actual === expected);
    });

    // correct format and value

    it('should return true when str is correct date time range format.', function () {
      var actual = validators.isDateString('1970-01-01T00:00Z/1970-01-01T00:01Z');
      var expected = true;

      assert(actual === expected);
    });

    it('should return true when str is correct date time range format.', function () {
      var actual = validators.isDateString('1970-01-01T00:00Z/1970-01-01T24:00Z');
      var expected = true;

      assert(actual === expected);
    });

    it('should return true when str is correct date time range format.', function () {
      var actual = validators.isDateString('1970-01-01T23:59Z/1970-01-01T24:00Z');
      var expected = true;

      assert(actual === expected);
    });

    it('should return true when str is correct date time range format.', function () {
      var actual = validators.isDateString('0000-01-01T00:00Z/9999-12-31T24:00Z');
      var expected = true;

      assert(actual === expected);
    });
  });
});