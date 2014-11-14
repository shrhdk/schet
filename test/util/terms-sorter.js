var assert = require('power-assert');

var sort = require('../../lib/util/terms-sorter');

describe('sort', function () {
    it('terms', function () {
        var given = {
            1: '2015-01-03T01:00Z/2015-01-03T02:00Z',
            2: '2015-01-02T09:00Z',
            3: '2015-01-02/2015-01-03',
            4: '2015-01-02T00:00Z/2015-01-02T01:00Z',
            5: '2015-01-02',
            6: '2015-01-01T09:00Z',
            7: '2015-01-01/2015-01-02',
            8: '2015-01-01T00:00Z/2015-01-01T01:00Z',
            9: '2015-01-01'
        };

        var expected = [
            {id: 9, term: '2015-01-01'},
            {id: 8, term: '2015-01-01T00:00Z/2015-01-01T01:00Z'},
            {id: 7, term: '2015-01-01/2015-01-02'},
            {id: 6, term: '2015-01-01T09:00Z'},
            {id: 5, term: '2015-01-02'},
            {id: 4, term: '2015-01-02T00:00Z/2015-01-02T01:00Z'},
            {id: 3, term: '2015-01-02/2015-01-03'},
            {id: 2, term: '2015-01-02T09:00Z'},
            {id: 1, term: '2015-01-03T01:00Z/2015-01-03T02:00Z'}
        ];

        var actual = sort(given);

        assert.deepEqual(actual, expected);
    });
});
