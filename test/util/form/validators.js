'use strict';

var assert = require('assert');

var whitespace = require('../../../src/util/form/constants').whitespace;
var GiveAndExpect = require('../../test-helper').GiveAndExpect;

var validators = require('../../../src/util/form/validators');

describe('validators', () => {
  describe('isNotWhitespace', () => {
    let test = new GiveAndExpect(validators.isNotWhitespace);

    it('should return true when str is empty.',
      test.give('').expect(false));

    it('should return true when str is whitespace.',
      test.give(whitespace).expect(false));

    it('should return false when str includes non whitespace.',
      test.give(whitespace + 'foo').expect(true));

    it('should return false when str includes non whitespace.',
      test.give('foo' + whitespace).expect(true));
  });

  describe('isOneLine', () => {
    let test = new GiveAndExpect(validators.isOneLine);

    it('should return false when str contains \\n',
      test.give('hello\nworld').expect(false));

    it('should return false when str contains \\r',
      test.give('hello\rworld').expect(false));

    it('should return false when str contains \\r\\n',
      test.give('hello\r\nworld').expect(false));

    it('should return true when str does not contains new line',
      test.give('hello world').expect(true));
  });

  describe('list', () => {
    it('with no params should throws Error', () => {
      assert.throws(() => validators.list());
    });

    it('should return true when value is in list.', () => {
      let v = validators.list('foo', 'bar', 'baz');

      assert.strictEqual(v('foo'), true);
      assert.strictEqual(v('bar'), true);
      assert.strictEqual(v('baz'), true);
      assert.strictEqual(v('qux'), false);
    });
  });

  describe('ge', () => {
    it('(-1) should return true when value is greater than or equal to -1.', () => {
      let v = validators.ge(-1);

      assert.strictEqual(v(-2), false);
      assert.strictEqual(v(-1), true);
      assert.strictEqual(v(+0), true);
      assert.strictEqual(v(+1), true);
    });

    it('(0) should return true when value is greater than or equal to 0.', () => {
      let v = validators.ge(0);

      assert.strictEqual(v(-1), false);
      assert.strictEqual(v(+0), true);
      assert.strictEqual(v(+1), true);
    });

    it('(1) should return true when value is greater than or equal to 1.', () => {
      let v = validators.ge(1);

      assert.strictEqual(v(-1), false);
      assert.strictEqual(v(+0), false);
      assert.strictEqual(v(+1), true);
      assert.strictEqual(v(+2), true);
    });
  });

  describe('range', () => {
    it('(1, -1) should throws Error', () => {
      assert.throws(() => validators.range(1, -1));
    });

    it('(-2, -1) should return true when (-2 <= value <= -1).', () => {
      let v = validators.range(-2, -1);

      assert.strictEqual(v(-3), false);
      assert.strictEqual(v(-2), true);
      assert.strictEqual(v(-1), true);
      assert.strictEqual(v(+0), false);
      assert.strictEqual(v(+1), false);
    });

    it('(-1, 1) should return true when (-1 <= value <= 1).', () => {
      let v = validators.range(-1, 1);

      assert.strictEqual(v(-2), false);
      assert.strictEqual(v(-1), true);
      assert.strictEqual(v(+0), true);
      assert.strictEqual(v(+1), true);
      assert.strictEqual(v(+2), false);
    });

    it('(1, 2) should return true when (1 <= value <= 2).', () => {
      let v = validators.range(1, 2);

      assert.strictEqual(v(-1), false);
      assert.strictEqual(v(+0), false);
      assert.strictEqual(v(+1), true);
      assert.strictEqual(v(+2), true);
      assert.strictEqual(v(+3), false);
    });
  });

  describe('length', () => {
    it('(2, 1) should throws Error', () => {
      assert.throws(() => validators.length(2, 1));
    });

    it('(-1, 1) should throws Error', () => {
      assert.throws(() => validators.length(-1, 1));
    });

    it('(0, 0) should return true when (value.length == 0).', () => {
      let v = validators.length(0, 0);

      assert.strictEqual(v(''), true);
      assert.strictEqual(v('1'), false);
    });

    it('(0, 2) should return true when (0 <= value.length <= 2).', () => {
      let v = validators.length(0, 2);

      assert.strictEqual(v(''), true);
      assert.strictEqual(v('1'), true);
      assert.strictEqual(v('12'), true);
      assert.strictEqual(v('123'), false);
    });

    it('(1, 2) should return true when (1 <= value.length <= 2).', () => {
      let v = validators.length(1, 2);

      assert.strictEqual(v(''), false);
      assert.strictEqual(v('1'), true);
      assert.strictEqual(v('12'), true);
      assert.strictEqual(v('123'), false);
    });
  });

  describe('date', () => {
    let test = new GiveAndExpect(validators.isDateString);

    context('should return false when there is wrong format in', ()=> {
      it('all',
        test.give('foo').expect(false));

      it('year',
        test.give('01234-01-01').expect(false));

      it('month',
        test.give('1970-012-01').expect(false));

      it('date',
        test.give('1970-01-012').expect(false));
    });

    context('should return false when', () => {
      it('month is 00',
        test.give('1970-00-01').expect(false));

      it('month is 13',
        test.give('1970-13-01').expect(false));

      it('date is 01/00',
        test.give('1970-01-00').expect(false));

      it('date is 02/30',
        test.give('1970-02-30').expect(false));
    });

    context('should return true when', () => {
      it('all is correct',
        test.give('1970-01-01').expect(true));

      it('all is correct',
        test.give('1970-12-31').expect(true));
    });
  });

  describe('date range', () => {
    let test = new GiveAndExpect(validators.isDateString);

    context('should return false when', () => {
      it('start month is 00',
        test.give('1970-00-01/1970-01-01').expect(false));

      it('start date is 01/00',
        test.give('1970-01-00/1970-03-01').expect(false));

      it('start date is 02/30',
        test.give('1970-02-30/1970-03-01').expect(false));

    });

    context('should return false when', () => {
      it('end month is 13',
        test.give('1970-01-01/1970-13-01').expect(false));

      it('end date is 02/00',
        test.give('1970-01-01/1970-02-00').expect(false));

      it('end date is 02/30',
        test.give('1970-01-01/1970-02-30').expect(false));
    });

    context('should return false when', () => {
      it('end date equals to start date.',
        test.give('1970-01-01/1970-01-01').expect(false));

      it('end date earlier than start date.',
        test.give('1970-01-02/1970-01-01').expect(false));
    });

    context('should return true when', () => {
      it('all is correct',
        test.give('1970-01-01/1970-01-02').expect(true));

      it('all is correct',
        test.give('0000-01-01/9999-12-31').expect(true));
    });
  });

  describe('date time', () => {
    let test = new GiveAndExpect(validators.isDateString);

    context('should return false when there is wrong format in', () => {
      it('year',
        test.give('01234-01-01T00:00Z').expect(false));

      it('month',
        test.give('1970-012-01T00:00Z').expect(false));

      it('date',
        test.give('1970-01-012T00:00Z').expect(false));

      it('hours',
        test.give('1970-01-01T012:00Z').expect(false));

      it('minutes',
        test.give('1970-01-01T00:012Z').expect(false));
    });

    context('should return false when', () => {
      it('month is 00',
        test.give('1970-00-01T00:00Z').expect(false));

      it('month is 13',
        test.give('1970-13-01T00:00Z').expect(false));

      it('date is 02/00',
        test.give('1970-01-00T00:00Z').expect(false));

      it('date is 02/30',
        test.give('1970-02-30T00:00Z').expect(false));

      it('hours is 25',
        test.give('1970-01-01T25:00Z').expect(false));

      it('minutes is 60',
        test.give('1970-01-01T00:60Z').expect(false));

      it('time is 24:01',
        test.give('1970-01-01T24:01Z').expect(false));
    });

    context('should return true when', () => {
      it('all is correct',
        test.give('1970-01-01T00:00Z').expect(true));

      it('all is correct',
        test.give('1970-01-01T00:01Z').expect(true));

      it('all is correct',
        test.give('1970-01-01T23:59Z').expect(true));

      it('all is correct',
        test.give('1970-01-01T24:00Z').expect(true));
    });
  });

  describe('date time range', () => {
    let test = new GiveAndExpect(validators.isDateString);

    context('should return false when there is wrong format in', () => {
      it('start year.',
        test.give('00000-01-01T00:00Z/0001-01-01T00:00Z').expect(false));

      it('start month.',
        test.give('1970-001-01T00:00Z/1970-01-02T00:00Z').expect(false));

      it('start date.',
        test.give('1970-01-001T00:00Z/1970-01-02T00:00Z').expect(false));

      it('start hours.',
        test.give('1970-01-01T000:00Z/1970-01-01T00:01Z').expect(false));

      it('start minutes.',
        test.give('1970-01-01T00:001Z/1970-01-01T00:02Z').expect(false));
    });

    context('should return false when there is wrong format in', () => {
      it('end year.',
        test.give('0000-01-01T00:00Z/00001-01-01T00:00Z').expect(false));

      it('end month.',
        test.give('1970-01-01T00:00Z/1970-001-02T00:00Z').expect(false));

      it('end date.',
        test.give('1970-01-01T01:00Z/1970-01-002T00:00Z').expect(false));

      it('end hours.',
        test.give('1970-01-01T00:00Z/1970-01-01T001:00Z').expect(false));

      it('end minutes.',
        test.give('1970-01-01T00:00Z/1970-01-01T00:001Z').expect(false));
    });

    context('should return false when', () => {
      it('start month is 00/01',
        test.give('1970-00-01T00:00Z/1970-01-01T00:00Z').expect(false));

      it('start date is 01/00',
        test.give('1970-01-00T00:00Z/1970-01-01T00:00Z').expect(false));

      it('start date is 02/30',
        test.give('1970-02-30T00:00Z/1970-03-01T00:00Z').expect(false));

      it('start hours is 25:00',
        test.give('1970-01-01T25:00Z/1970-02-01T00:00Z').expect(false));

      it('start minutes is 00:60',
        test.give('1970-01-01T00:60Z/1970-01-02T00:00Z').expect(false));

      it('start time is 24:01',
        test.give('1970-01-01T24:01Z/1970-02-01T00:00Z').expect(false));
    });

    context('should return false when', () => {
      it('end month is 13/01',
        test.give('1970-01-01T00:00Z/1970-13-01T00:00Z').expect(false));

      it('end date is 02/00',
        test.give('1970-01-01T00:00Z/1970-02-00T00:00Z').expect(false));

      it('end date is 02/30',
        test.give('1970-02-01T00:00Z/1970-02-30T00:00Z').expect(false));

      it('end hours is 25:00',
        test.give('1970-01-01T00:00Z/1970-02-01T25:00Z').expect(false));

      it('end minutes is 00:60',
        test.give('1970-01-01T00:00Z/1970-01-01T00:60Z').expect(false));

      it('end time is 24:01',
        test.give('1970-01-01T00:00Z/1970-01-01T24:01Z').expect(false));
    });

    context('should return false when', () => {
      it('end time equals to start time.',
        test.give('1970-01-01T00:00Z/1970-01-01T00:00Z').expect(false));

      it('end time is earlier than start time.',
        test.give('1970-01-01T00:01Z/1970-01-01T00:00Z').expect(false));
    });

    context('should return true when', () => {
      it('all is correct',
        test.give('1970-01-01T00:00Z/1970-01-01T00:01Z').expect(true));

      it('all is  correct',
        test.give('1970-01-01T00:00Z/1970-01-01T24:00Z').expect(true));

      it('all is  correct',
        test.give('1970-01-01T23:59Z/1970-01-01T24:00Z').expect(true));

      it('all is  correct',
        test.give('0000-01-01T00:00Z/9999-12-31T24:00Z').expect(true));
    });
  });
});