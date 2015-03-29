'use strict';

var assert = require('assert');

var iso8601 = require('../../src/util/iso8601.js');

describe('iso8601', () => {
  before(() => {
    process.env.LANG = 'en_US';
  });

  describe('compare', () => {
    it('sort terms', () => {
      let given = [
        '2015-01-03T01:00Z/2015-01-03T02:00Z',
        '2015-01-02T09:00Z',
        '2015-01-02/2015-01-03',
        '2015-01-02T00:00Z/2015-01-02T01:00Z',
        '2015-01-02',
        '2015-01-01T09:00Z',
        '2015-01-01/2015-01-02',
        '2015-01-01T00:00Z/2015-01-01T01:00Z',
        '2015-01-01'
      ];

      let expected = [
        "2015-01-01",
        "2015-01-01T00:00Z/2015-01-01T01:00Z",
        "2015-01-01/2015-01-02",
        "2015-01-01T09:00Z",
        "2015-01-02",
        "2015-01-02T00:00Z/2015-01-02T01:00Z",
        "2015-01-02/2015-01-03",
        "2015-01-02T09:00Z",
        "2015-01-03T01:00Z/2015-01-03T02:00Z"
      ];

      let actual = given.sort(iso8601.compare);

      assert.deepEqual(actual, expected);
    });
  });

  describe('normalize', () => {
    let normalize = (str) => {
      return () => {
        assert.throws(() => iso8601.normalize(str));
      };
    };

    let give = (given, offset = 0) => {
      return {
        expect(expected) {
          return () => {
            let actual = iso8601.normalize(given, offset);
            assert.strictEqual(actual, expected);
          };
        }
      }
    };

    describe('date', () => {
      it('correct', give('2000/01/02').expect('2000-01-02'));

      it('incorrect month', normalize('2000/13/01'));

      it('incorrect date', normalize('2000/01/32'));
    });

    describe('date range', () => {
      describe('full', () => {
        it('correct', give('2000/01/01 - 2000/01/02').expect('2000-01-01/2000-01-02'));

        it('start equals end', normalize('2000/01/01 - 2000/01/01'));

        it('end is earlier than start', normalize('2000/01/02 - 2000/01/01'));

        it('incorrect start month', normalize('2000/13/01 - 2002/01/01'));

        it('incorrect start date', normalize('2000/01/32 - 2001/01/01'));

        it('incorrect start date (02/30)', normalize('2000/02/30 - 2002/01/31'));

        it('incorrect end month', normalize('2000/01/01 - 2000/13/01'));

        it('incorrect end date', normalize('2000/01/01 - 2000/01/32'));

        it('incorrect end date (02/30)', normalize('2000/01/01 - 2000/02/30'));
      });

      describe('omit year', () => {
        it('correct', give('2000/01/01 - 01/02').expect('2000-01-01/2000-01-02'));

        it('start equals end', normalize('2000/01/01 - 01/01'));

        it('end is earlier than start', normalize('2000/01/02 - 01/01'));

        it('incorrect start month', normalize('2000/13/01 - 01/01'));

        it('incorrect start date', normalize('2000/01/32 - 01/01'));

        it('incorrect start date (02/30)', normalize('2000/02/30 - 01/31'));

        it('incorrect end month', normalize('2000/01/01 - 13/01'));

        it('incorrect end date', normalize('2000/01/01 - 01/32'));

        it('incorrect end date (02/30)', normalize('2000/01/01 - 02/30'));
      });
    });

    describe('date time', () => {
      it('correct', give('2000/01/01 09:30').expect('2000-01-01T09:30Z'));

      it('with offset', give('2000/01/01 09:30', 9 * 60).expect('2000-01-01T00:30Z'));

      it('incorrect month', normalize('2000/13/01 00:00'));

      it('incorrect date', normalize('2000/01/32 00:00'));

      it('incorrect hour', normalize('2000/01/01 25:00'));

      it('incorrect minutes', normalize('2000/01/01 00:60'));
    });

    describe('date time range', () => {
      describe('full', () => {
        it('correct', give('2000/01/01 00:00 - 2000/01/01 00:01').expect('2000-01-01T00:00Z/2000-01-01T00:01Z'));

        it('start equals end', normalize('2000/01/01 00:00 - 2000/01/01 00:00'));

        it('end is earlier than start', normalize('2000/01/01 00:01 - 2000/01/01 00:00'));

        it('incorrect start month', normalize('2000/13/01 00:00 - 2002/01/01 00:00'));

        it('incorrect start date', normalize('2000/01/32 00:00 - 2002/01/01 00:00'));

        it('incorrect start date (02/30)', normalize('2000/02/30 00:00 - 2002/01/31 00:00'));

        it('incorrect start hour', normalize('2000/01/01 25:00 - 2002/01/01 00:00'));

        it('incorrect start minutes', normalize('2000/01/01 00:60 - 2002/01/01 00:00'));

        it('incorrect end month', normalize('2000/01/01 00:00 - 2000/13/01 00:00'));

        it('incorrect end date', normalize('2000/01/01 00:00 - 2000/01/32 00:00'));

        it('incorrect end date (02/30)', normalize('2000/01/01 00:00 - 2000/02/30 00:00'));

        it('incorrect end hour', normalize('2000/01/01 00:00 - 2000/01/01 25:00'));

        it('incorrect end minutes', normalize('2000/01/01 00:00 - 2000/01/01 00:60'));
      });

      describe('omit date', () => {
        it('correct', give('2000/01/01 00:00 - 00:01').expect('2000-01-01T00:00Z/2000-01-01T00:01Z'));

        it('start equals end', normalize('2000/01/01 00:00 - 00:00'));

        it('end is earlier than start', normalize('2000/01/01 00:01 - 00:00'));

        it('incorrect start month', normalize('2000/13/01 00:00 - 00:00'));

        it('incorrect start date', normalize('2000/01/32 00:00 - 00:00'));

        it('incorrect start date (02/30)', normalize('2000/02/30 00:00 - 00:00'));

        it('incorrect start hour', normalize('2000/01/01 25:00 - 00:00'));

        it('incorrect start minutes', normalize('2000/01/01 00:60 - 00:00'));

        it('incorrect end hour', normalize('2000/01/01 00:00 - 25:00'));

        it('incorrect end minutes', normalize('2000/01/01 00:00 - 00:60'));
      });

      describe('omit year', () => {
        it('correct', give('2000/01/01 00:00 - 01/01 00:01').expect('2000-01-01T00:00Z/2000-01-01T00:01Z'));

        it('start equals end', normalize('2000/01/01 00:00 - 01/01 00:00'));

        it('end is earlier than start', normalize('2000/01/01 00:01 - 01/01 00:00'));

        it('incorrect start month', normalize('2000/13/01 00:00 - 01/01 00:00'));

        it('incorrect start date', normalize('2000/01/32 00:00 - 01/01 00:00'));

        it('incorrect start date (02/30)', normalize('2000/02/30 00:00 - 01/31 00:00'));

        it('incorrect start hour', normalize('2000/01/01 25:00 - 01/01 00:00'));

        it('incorrect start minutes', normalize('2000/01/01 00:60 - 01/01 00:00'));

        it('incorrect end month', normalize('2000/01/01 00:00 - 13/01 00:00'));

        it('incorrect end date', normalize('2000/01/01 00:00 - 01/32 00:00'));

        it('incorrect end date (02/30)', normalize('2000/01/01 00:00 - 02/30 00:00'));

        it('incorrect end hour', normalize('2000/01/01 00:00 - 01/01 25:00'));

        it('incorrect end minutes', normalize('2000/01/01 00:00 - 01/01 00:60'));
      });
    });
  });

  describe('prettify', () => {
    let give = (given, offset = 0) => {
      return {
        expect(expected) {
          return () => {
            let actual = iso8601.prettify(given, offset);
            assert.strictEqual(actual, expected);
          };
        }
      }
    };

    it('omit date', give('2015-01-01T00:00Z/2015-01-01T01:00Z').expect('2015/01/01(Thu) 00:00 - 01:00'));
  });
});