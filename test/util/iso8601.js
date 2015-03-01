'use strict';

var assert = require('power-assert');

var iso8601 = require('../../src/util/iso8601.js');

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
  describe('date', () => {
    it('correct', () => {

    });

    it('incorrect month', () => {

    });

    it('incorrect date', () => {

    });
  });

  describe('date range', () => {
    it('full', () => {

    });

    it('omit year', () => {

    });

    it('incorrect start month', () => {

    });

    it('incorrect start date', () => {

    });

    it('incorrect end month', () => {

    });

    it('incorrect end date', () => {

    });

    it('end earlier than start', () => {

    });
  });

  describe('date time', () => {
    it('correct', () => {

    });

    it('24:00', () => {

    });

    it('with offset', () => {

    });

    it('incorrect month', () => {

    });

    it('incorrect date', () => {

    });

    it('incorrect hour', () => {

    });

    it('incorrect minutes', () => {

    });
  });

  describe('date time range', () => {
    it('full', () => {

    });

    it('omit date', () => {

    });

    it('omit year', () => {

    });

    it('end earlier than start', () => {

    });
  });
});

describe('prettify', () => {

});
