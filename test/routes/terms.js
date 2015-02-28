/*eslint strict:0*/

var async = require('async');
var ERRORS = require('../../src/errors');
var mongo = require('../../src/models/mongo');
var req = require('./../test-helper').req;

var DATE_1 = '2014-01-01';
var DATE_2 = '2014-12-31';
var INVALID_DATE = '2014-02-30';
var INVALID_DATE_MONTH = '2014-00-01';
var INVALID_DATE_DAY = '2014-01-00';

var DATE_RANGE_1 = '2014-01-01/2014-01-02';
var DATE_RANGE_2 = '0000-01-01/9999-12-31';
var DATE_RANGE_END_EQUALS_TO_START = '2014-01-01/2014-01-01';
var DATE_RANGE_END_IS_EARLIER_THAN_START = '2014-01-02/2014-01-01';
var INVALID_DATE_RANGE_START = '2014-02-30/2014-04-01';
var INVALID_DATE_RANGE_START_MONTH = '2014-00-01/2014-01-01';
var INVALID_DATE_RANGE_START_DAY = '2014-01-00/2014-01-01';
var INVALID_DATE_RANGE_END = '2014-01-01/2014-02-30';
var INVALID_DATE_RANGE_END_MONTH = '2014/01-01/2014-13-01';
var INVALID_DATE_RANGE_END_DAY = '2014-01-01/2014-01-32';

var DATE_TIME_1 = '2014-01-01T00:00Z';
var DATE_TIME_2 = '2014-01-01T24:00Z';
var INVALID_DATE_TIME_DATE = '2014-02-30T00:00Z';
var INVALID_DATE_TIME_TIME = '2014-01-01T24:01Z';
var INVALID_DATE_TIME_MONTH = '2014-00-01T00:00Z';
var INVALID_DATE_TIME_DAY = '2014-01-00T00:00Z';
var INVALID_DATE_TIME_HOURS = '2014-01-01T25:00Z';
var INVALID_DATE_TIME_MINUTES = '2014-01-01T00:60Z';

var DATE_TIME_RANGE_1 = '2014-01-01T00:00Z/2014-01-01T00:01Z';
var DATE_TIME_RANGE_2 = '0000-01-01T00:00Z/9999-12-31T24:00Z';
var DATE_TIME_RANGE_END_EQUALS_TO_START = '2014-01-01T00:00Z/2014-01-01T00:00Z';
var DATE_TIME_RANGE_END_IS_EARLIER_THAN_START = '2014-01-00T00:01Z/2014-01-01T00:00Z';
var INVALID_DATE_TIME_RANGE_START = '2014-02-30T00:00Z/2014-04-01T00:00Z';
var INVALID_DATE_TIME_RANGE_START_MONTH = '2014-00-01T00:00Z/2014-01-01T00:00Z';
var INVALID_DATE_TIME_RANGE_START_DAY = '2014-01-00T00:00Z/2014-01-01T00:00Z';
var INVALID_DATE_TIME_RANGE_START_TIME = '2014-01-01T24:01Z/2014-01-03T00:00Z';
var INVALID_DATE_TIME_RANGE_START_HOURS = '2014-01-01T25:00Z/2014-01-03T00:00Z';
var INVALID_DATE_TIME_RANGE_START_MINUTES = '2014-01-01T00:60Z/2014-01-01T03:00Z';
var INVALID_DATE_TIME_RANGE_END = '2014-01-01T00:00Z/2014-02-30T00:00Z';
var INVALID_DATE_TIME_RANGE_END_MONTH = '2014-01-01T00:00Z/2014-13-01T00:00Z';
var INVALID_DATE_TIME_RANGE_END_DAY = '2014-01-01T00:00Z/2014-01-32T00:00Z';
var INVALID_DATE_TIME_RANGE_END_TIME = '2014-01-01T00:00Z/2014-01-01T24:01Z';
var INVALID_DATE_TIME_RANGE_END_HOURS = '2014-01-01T00:00Z/2014-01-01T25:00Z';
var INVALID_DATE_TIME_RANGE_END_MINUTES = '2014-01-01T00:00Z/2014-01-01T00:60Z';

var PRESET_TERM_1 = DATE_1;
var PRESET_TERM_2 = DATE_RANGE_1;
var PRESET_TERM_4 = DATE_TIME_1;
var PRESET_TERM_5 = DATE_TIME_RANGE_1;

describe('Term', () => {
  /* Initialize DB */
  beforeEach(function (done) {
    mongo.init({
      counters: [
        {id: 'events', seq: 5}
      ],
      events: [
        {
          id: 1, title: 'first', description: 'first_desc',
          terms: {counter: 0},
          participants: {counter: 0},
          record: {},
          comments: {counter: 0}
        },
        {
          id: 2, title: 'second', description: 'second_desc',
          terms: {counter: 0},
          participants: {counter: 0},
          record: {},
          comments: {counter: 0}
        },
        // third acts as deleted event.
        {
          // Unfixed event
          id: 4, title: 'forth', description: 'forth_desc',
          terms: {
            counter: 5,
            1: PRESET_TERM_1,
            2: PRESET_TERM_2,
            // third acts as deleted Term
            4: PRESET_TERM_4,
            5: PRESET_TERM_5
          },
          participants: {counter: 0},
          record: {},
          comments: {counter: 0}
        },
        {
          // Fixed event
          id: 5, title: 'fifth', description: 'fifth_desc', fixed: 1,
          terms: {
            counter: 5,
            1: PRESET_TERM_1,
            2: PRESET_TERM_2,
            // third acts as deleted Term
            4: PRESET_TERM_4,
            5: PRESET_TERM_5
          },
          participants: {counter: 0},
          record: {},
          comments: {counter: 0}
        }
      ]
    }, done);
  });

  describe('POST', () => {
    context('400 InvalidParameterError', () => {
      it('/1/terms with no params.', function (done) {
        req('POST', '/1/terms', {}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_MONTH}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_DAY}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: DATE_RANGE_END_EQUALS_TO_START}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: DATE_RANGE_END_IS_EARLIER_THAN_START}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_RANGE_START}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_RANGE_START_MONTH}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_RANGE_START_DAY}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_RANGE_END}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_RANGE_END_MONTH}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_RANGE_END_DAY}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_TIME_DATE}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_TIME_TIME}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_TIME_MONTH}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_TIME_DAY}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_TIME_HOURS}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_TIME_MINUTES}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: DATE_TIME_RANGE_END_EQUALS_TO_START}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: DATE_TIME_RANGE_END_IS_EARLIER_THAN_START}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_TIME_RANGE_START}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_TIME_RANGE_START_MONTH}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_TIME_RANGE_START_DAY}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_TIME_RANGE_START_TIME}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_TIME_RANGE_START_HOURS}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_TIME_RANGE_START_MINUTES}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_TIME_RANGE_END}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_TIME_RANGE_END_TIME}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_TIME_RANGE_END_MONTH}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_TIME_RANGE_END_DAY}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_TIME_RANGE_END_HOURS}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/terms with invalid term.', function (done) {
        req('POST', '/1/terms', {term: INVALID_DATE_TIME_RANGE_END_MINUTES}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });
    });

    context('404 NotFoundError', () => {
      it('/0/terms', function (done) {
        req('POST', '/0/terms', {term: DATE_2})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });

      it('/3/terms', function (done) {
        req('POST', '/3/terms', {term: DATE_2})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });

      it('/6/terms', function (done) {
        req('POST', '/6/terms', {term: DATE_2})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });
    });

    context('409 FixedEventError', () => {
      it('/5/terms', function (done) {
        req('POST', '/5/terms', {term: DATE_2})
          .expect(409, ERRORS.FIXED_EVENT_ERROR.json, done);
      });
    });

    context('409 DuplicatedTermError', () => {
      it('/4/terms with existing term.', function (done) {
        req('POST', '/4/terms', {term: PRESET_TERM_1})
          .expect(409, ERRORS.DUPLICATED_TERM_ERROR.json, done);
      });

      it('/4/terms with existing term.', function (done) {
        req('POST', '/4/terms', {term: PRESET_TERM_2})
          .expect(409, ERRORS.DUPLICATED_TERM_ERROR.json, done);
      });

      it('/4/terms with existing term.', function (done) {
        req('POST', '/4/terms', {term: PRESET_TERM_4})
          .expect(409, ERRORS.DUPLICATED_TERM_ERROR.json, done);
      });

      it('/4/terms with existing term.', function (done) {
        req('POST', '/4/terms', {term: PRESET_TERM_5})
          .expect(409, ERRORS.DUPLICATED_TERM_ERROR.json, done);
      });
    });

    context('201 Created', () => {
      it('/1/terms with correct term.', function (done) {
        req('POST', '/1/terms', {term: DATE_1})
          .expect(201, {
            id: 1, title: 'first', description: 'first_desc',
            terms: {
              1: DATE_1
            },
            participants: {}, record: {}, comments: {}
          }, done);
      });

      it('/1/terms with correct term.', function (done) {
        req('POST', '/1/terms', {term: DATE_2})
          .expect(201, {
            id: 1, title: 'first', description: 'first_desc',
            terms: {
              1: DATE_2
            },
            participants: {}, record: {}, comments: {}
          }, done);
      });

      it('/1/terms with correct term.', function (done) {
        req('POST', '/1/terms', {term: DATE_RANGE_1})
          .expect(201, {
            id: 1, title: 'first', description: 'first_desc',
            terms: {
              1: DATE_RANGE_1
            },
            participants: {}, record: {}, comments: {}
          }, done);
      });

      it('/1/terms with correct term.', function (done) {
        req('POST', '/1/terms', {term: DATE_RANGE_2})
          .expect(201, {
            id: 1, title: 'first', description: 'first_desc',
            terms: {
              1: DATE_RANGE_2
            },
            participants: {}, record: {}, comments: {}
          }, done);
      });

      it('/1/terms with correct term.', function (done) {
        req('POST', '/1/terms', {term: DATE_TIME_1})
          .expect(201, {
            id: 1, title: 'first', description: 'first_desc',
            terms: {
              1: DATE_TIME_1
            },
            participants: {}, record: {}, comments: {}
          }, done);
      });

      it('/1/terms with correct term.', function (done) {
        req('POST', '/1/terms', {term: DATE_TIME_2})
          .expect(201, {
            id: 1, title: 'first', description: 'first_desc',
            terms: {
              1: DATE_TIME_2
            },
            participants: {}, record: {}, comments: {}
          }, done);
      });

      it('/1/terms with correct term.', function (done) {
        req('POST', '/1/terms', {term: DATE_TIME_RANGE_1})
          .expect(201, {
            id: 1, title: 'first', description: 'first_desc',
            terms: {
              1: DATE_TIME_RANGE_1
            },
            participants: {}, record: {}, comments: {}
          }, done);
      });

      it('/1/terms with correct term.', function (done) {
        req('POST', '/1/terms', {term: DATE_TIME_RANGE_2})
          .expect(201, {
            id: 1, title: 'first', description: 'first_desc',
            terms: {
              1: DATE_TIME_RANGE_2
            },
            participants: {}, record: {}, comments: {}
          }, done);
      });
    });

    context('201 Created (Increment ID per creation)', () => {
      it('/1/terms with correct terms should return TermID=1,2,3,4,...', function (done) {
        async.series([
          function (next) {
            req('POST', '/1/terms', {term: DATE_1})
              .expect(201, {
                id: 1, title: 'first', description: 'first_desc',
                terms: {
                  1: DATE_1
                },
                participants: {}, record: {}, comments: {}
              }, next);
          },
          function (next) {
            req('POST', '/1/terms', {term: DATE_2})
              .expect(201, {
                id: 1, title: 'first', description: 'first_desc',
                terms: {
                  1: DATE_1,
                  2: DATE_2
                },
                participants: {}, record: {}, comments: {}
              }, next);
          },
          function (next) {
            req('POST', '/1/terms', {term: DATE_RANGE_1})
              .expect(201, {
                id: 1, title: 'first', description: 'first_desc',
                terms: {
                  1: DATE_1,
                  2: DATE_2,
                  3: DATE_RANGE_1
                },
                participants: {}, record: {}, comments: {}
              }, next);
          },
          function (next) {
            req('POST', '/1/terms', {term: DATE_RANGE_2})
              .expect(201, {
                id: 1, title: 'first', description: 'first_desc',
                terms: {
                  1: DATE_1,
                  2: DATE_2,
                  3: DATE_RANGE_1,
                  4: DATE_RANGE_2
                },
                participants: {}, record: {}, comments: {}
              }, next);
          }
        ], done);
      });

      it('/4/terms with correct term should return TermID=6', function (done) {
        req('POST', '/4/terms', {term: DATE_2})
          .expect(201, {
            id: 4, title: 'forth', description: 'forth_desc',
            terms: {
              1: PRESET_TERM_1,
              2: PRESET_TERM_2,
              // third acts as deleted Term
              4: PRESET_TERM_4,
              5: PRESET_TERM_5,
              6: DATE_2
            },
            participants: {}, record: {}, comments: {}
          }, done);
      });
    });
  });

  describe('PUT', () => {
    context('400 InvalidParameterError', () => {
      it('/4/terms/1 with no params.', function (done) {
        req('PUT', '/4/terms/1', {}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_MONTH}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_DAY}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: DATE_RANGE_END_EQUALS_TO_START}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: DATE_RANGE_END_IS_EARLIER_THAN_START}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_RANGE_START}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_RANGE_START_MONTH}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_RANGE_START_DAY}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_RANGE_END}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_RANGE_END_MONTH}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_RANGE_END_DAY}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_TIME_DATE}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_TIME_TIME}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_TIME_MONTH}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_TIME_DAY}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_TIME_HOURS}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_TIME_MINUTES}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: DATE_TIME_RANGE_END_EQUALS_TO_START}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: DATE_TIME_RANGE_END_IS_EARLIER_THAN_START}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_TIME_RANGE_START}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_TIME_RANGE_START_MONTH}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_TIME_RANGE_START_DAY}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_TIME_RANGE_START_TIME}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_TIME_RANGE_START_HOURS}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_TIME_RANGE_START_MINUTES}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_TIME_RANGE_END}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_TIME_RANGE_END_TIME}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_TIME_RANGE_END_MONTH}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_TIME_RANGE_END_DAY}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_TIME_RANGE_END_HOURS}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/terms/1 with invalid term.', function (done) {
        req('PUT', '/4/terms/1', {term: INVALID_DATE_TIME_RANGE_END_MINUTES}).expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });
    });

    context('404 NotFoundError', () => {
      it('/0/terms/1', function (done) {
        req('PUT', '/0/terms/1', {term: DATE_2})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });

      it('/3/terms/1', function (done) {
        req('PUT', '/3/terms/1', {term: DATE_2})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });

      it('/6/terms/1', function (done) {
        req('PUT', '/6/terms/1', {term: DATE_2})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });
    });

    context('409 FixedEventError', () => {
      it('/5/terms/1', function (done) {
        req('PUT', '/5/terms/1', {term: DATE_2})
          .expect(409, ERRORS.FIXED_EVENT_ERROR.json, done);
      });
    });

    context('404 TermNotFoundError', () => {
      it('/4/terms/3', function (done) {
        req('PUT', '/4/terms/3', {term: DATE_2})
          .expect(404, ERRORS.TERM_NOT_FOUND_ERROR.json, done);
      });

      it('/4/terms/5', function (done) {
        req('PUT', '/4/terms/6', {term: DATE_2})
          .expect(404, ERRORS.TERM_NOT_FOUND_ERROR.json, done);
      });
    });

    context('409 DuplicatedTermError', () => {
      it('/4/terms/1 with existing term.', function (done) {
        req('PUT', '/4/terms/1', {term: PRESET_TERM_2})
          .expect(409, ERRORS.DUPLICATED_TERM_ERROR.json, done);
      });
    });

    context('200 OK', () => {
      it('/4/terms/1 with correct term.', function (done) {
        req('PUT', '/4/terms/1', {term: DATE_2})
          .expect(200, {
            id: 4, title: 'forth', description: 'forth_desc',
            terms: {
              1: DATE_2,
              2: PRESET_TERM_2,
              // third acts as deleted Term
              4: PRESET_TERM_4,
              5: PRESET_TERM_5
            },
            participants: {}, record: {}, comments: {}
          }, done);
      });

      it('/4/terms/1 with correct term.', function (done) {
        req('PUT', '/4/terms/1', {term: DATE_RANGE_2})
          .expect(200, {
            id: 4, title: 'forth', description: 'forth_desc',
            terms: {
              1: DATE_RANGE_2,
              2: PRESET_TERM_2,
              // third acts as deleted Term
              4: PRESET_TERM_4,
              5: PRESET_TERM_5
            },
            participants: {}, record: {}, comments: {}
          }, done);
      });

      it('/4/terms/1 with correct term.', function (done) {
        req('PUT', '/4/terms/1', {term: DATE_TIME_2})
          .expect(200, {
            id: 4, title: 'forth', description: 'forth_desc',
            terms: {
              1: DATE_TIME_2,
              2: PRESET_TERM_2,
              // third acts as deleted Term
              4: PRESET_TERM_4,
              5: PRESET_TERM_5
            },
            participants: {}, record: {}, comments: {}
          }, done);
      });

      it('/4/terms/1 with correct term.', function (done) {
        req('PUT', '/4/terms/1', {term: DATE_TIME_RANGE_2})
          .expect(200, {
            id: 4, title: 'forth', description: 'forth_desc',
            terms: {
              1: DATE_TIME_RANGE_2,
              2: PRESET_TERM_2,
              // third acts as deleted Term
              4: PRESET_TERM_4,
              5: PRESET_TERM_5
            },
            participants: {}, record: {}, comments: {}
          }, done);
      });

      it('/4/terms/1 with unmodified term.', function (done) {
        req('PUT', '/4/terms/1', {term: PRESET_TERM_1})
          .expect(200, {
            id: 4, title: 'forth', description: 'forth_desc',
            terms: {
              1: PRESET_TERM_1,
              2: PRESET_TERM_2,
              // third acts as deleted Term
              4: PRESET_TERM_4,
              5: PRESET_TERM_5
            },
            participants: {}, record: {}, comments: {}
          }, done);
      });
    });
  });

  describe('DELETE', () => {
    context('404 NotFoundError', () => {
      it('/0/terms/1', function (done) {
        req('DELETE', '/0/terms/1', {})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });

      it('/3/terms/1', function (done) {
        req('DELETE', '/3/terms/1', {})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });

      it('/6/terms/1', function (done) {
        req('DELETE', '/6/terms/1', {})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });
    });

    context('409 FixedEventError', () => {
      it('/5/terms/1', function (done) {
        req('DELETE', '/5/terms/1', {})
          .expect(409, ERRORS.FIXED_EVENT_ERROR.json, done);
      });
    });

    context('409 TermNotFoundError', () => {
      it('/4/terms/0', function (done) {
        req('DELETE', '/4/terms/0', {})
          .expect(404, ERRORS.TERM_NOT_FOUND_ERROR.json, done);
      });

      it('/4/terms/6', function (done) {
        req('DELETE', '/4/terms/6', {})
          .expect(404, ERRORS.TERM_NOT_FOUND_ERROR.json, done);
      });
    });

    context('200 OK', () => {
      it('/4/terms/3', function (done) {
        req('DELETE', '/4/terms/3', {})
          .expect(200, {
            id: 4, title: 'forth', description: 'forth_desc',
            terms: {
              1: PRESET_TERM_1,
              2: PRESET_TERM_2,
              // third acts as deleted Term
              4: PRESET_TERM_4,
              5: PRESET_TERM_5
            },
            participants: {},
            record: {},
            comments: {}
          }, done);
      });

      it('/4/terms/1', function (done) {
        req('DELETE', '/4/terms/1', {})
          .expect(200, {
            id: 4, title: 'forth', description: 'forth_desc',
            terms: {
              2: PRESET_TERM_2,
              // third acts as deleted Term
              4: PRESET_TERM_4,
              5: PRESET_TERM_5
            },
            participants: {},
            record: {},
            comments: {}
          }, done);
      });
    });
  });
});
