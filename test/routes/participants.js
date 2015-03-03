/*eslint strict:0*/

var async = require('async');
var ERRORS = require('../../src/errors');
var mongo = require('../../src/models/mongo');
var testHelper = require('./../test-helper');
var req = testHelper.req;
var dummyString = testHelper.dummyString;

describe('Participant', () => {
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
          terms: {counter: 0},
          participants: {
            counter: 5,
            1: 'alice',
            2: 'bob',
            // 3 charlie was deleted
            4: 'dave',
            5: 'ellen'
          },
          record: {
            1: {},
            2: {},
            // 3 charlie was deleted
            4: {},
            5: {}
          },
          comments: {counter: 0}
        },
        {
          // Fixed event
          id: 5, title: 'fifth', description: 'fifth_desc', fixed: 1,
          terms: {counter: 0},
          participants: {
            counter: 5,
            1: 'alice',
            2: 'bob',
            // 3 charlie was deleted
            4: 'dave',
            5: 'ellen'
          },
          record: {
            1: {},
            2: {},
            // 3 charlie was deleted
            4: {},
            5: {}
          },
          comments: {counter: 0}
        }
      ]
    }, done);
  });

  describe('POST', () => {
    context('400 InvalidParameterError', () => {
      it('/1/participants with no params.', function (done) {
        req('POST', '/1/participants', {})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/participants with empty name.', function (done) {
        req('POST', '/1/participants', {name: ''})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/participants with name consists of whitespace.', function (done) {
        req('POST', '/1/participants', {name: ' '})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/participants with name contains \\r.', function (done) {
        req('POST', '/1/participants', {name: 'hello\rworld'})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/participants with name contains \\n.', function (done) {
        req('POST', '/1/participants', {name: 'hello\nworld'})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/participants with name contains \\r\\n.', function (done) {
        req('POST', '/1/participants', {name: 'hello\r\nworld'})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1/participants with too long name.', function (done) {
        req('POST', '/1/participants', {name: dummyString(256)})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });
    });

    context('404 NotFoundError', () => {
      it('/0/participants', function (done) {
        req('POST', '/0/participants', {name: 'alice'})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });

      it('/3/participants', function (done) {
        req('POST', '/3/participants', {name: 'alice'})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });

      it('/6/participants', function (done) {
        req('POST', '/6/participants', {name: 'alice'})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });
    });

    context('409 FixedEventError', () => {
      it('/5/participants', function (done) {
        req('POST', '/5/participants', {name: 'frank'})
          .expect(409, ERRORS.FIXED_EVENT_ERROR.json, done);
      });
    });

    context('409 DuplicatedParticipantError', () => {
      it('/4/participants with existing name.', function (done) {
        req('POST', '/4/participants', {name: 'alice'})
          .expect(409, ERRORS.DUPLICATED_PARTICIPANT_ERROR.json, done);
      });
    });

    context('201 Created', () => {
      it('/1/participants with min length name.', function (done) {
        req('POST', '/1/participants', {name: '1'})
          .expect(201, {
            id: 1, title: 'first', description: 'first_desc',
            terms: {},
            participants: {
              1: '1'
            },
            record: {
              1: {}
            },
            comments: {}
          }, done);
      });

      it('/1/participants with min length name.', function (done) {
        req('POST', '/1/participants', {name: dummyString(255)})
          .expect(201, {
            id: 1, title: 'first', description: 'first_desc',
            terms: {},
            participants: {
              1: dummyString(255)
            },
            record: {
              1: {}
            },
            comments: {}
          }, done);
      });
    });

    context('201 Created (Increment ID per creation)', () => {
      it('/1/participants should return participantID=1,2,3,... per request', function (done) {
        async.series([
          function (next) {
            req('POST', '/1/participants', {name: 'alice'})
              .expect(201, {
                id: 1, title: 'first', description: 'first_desc',
                terms: {},
                participants: {
                  1: 'alice'
                },
                record: {
                  1: {}
                },
                comments: {}
              }, next);
          },
          function (next) {
            req('POST', '/1/participants', {name: 'bob'})
              .expect(201, {
                id: 1, title: 'first', description: 'first_desc',
                terms: {},
                participants: {
                  1: 'alice',
                  2: 'bob'
                },
                record: {
                  1: {},
                  2: {}
                },
                comments: {}
              }, next);
          },
          function (next) {
            req('POST', '/1/participants', {name: 'charlie'})
              .expect(201, {
                id: 1, title: 'first', description: 'first_desc',
                terms: {},
                participants: {
                  1: 'alice',
                  2: 'bob',
                  3: 'charlie'
                },
                record: {
                  1: {},
                  2: {},
                  3: {}
                },
                comments: {}
              }, next);
          }
        ], done);
      });

      it('/4/participants should return participantID=6', function (done) {
        req('POST', '/4/participants', {name: 'frank'})
          .expect(201, {
            id: 4, title: 'forth', description: 'forth_desc',
            terms: {},
            participants: {
              1: 'alice',
              2: 'bob',
              // 3 charlie was deleted
              4: 'dave',
              5: 'ellen',
              6: 'frank'
            },
            record: {
              1: {},
              2: {},
              // 3 charlie was deleted
              4: {},
              5: {},
              6: {}
            },
            comments: {}
          }, done);
      });
    });
  });

  describe('PUT', () => {
    context('400 InvalidParameterError', () => {
      it('/4/participants/1 with empty name.', function (done) {
        req('PUT', '/4/participants/1', {name: ''})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/participants/1 with name consists of whitespace.', function (done) {
        req('PUT', '/4/participants/1', {name: ' '})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/participants/1 with name contains \\r.', function (done) {
        req('PUT', '/4/participants/1', {name: 'hello\rworld'})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/participants/1 with name contains \\n.', function (done) {
        req('PUT', '/4/participants/1', {name: 'hello\nworld'})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/participants/1 with name contains \\r\\n.', function (done) {
        req('PUT', '/4/participants/1', {name: 'hello\r\nworld'})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/4/participants/1 with too long name.', function (done) {
        req('PUT', '/4/participants/1', {name: dummyString(256)})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });
    });

    context('404 NotFoundError', () => {
      it('/0/participants/1', function (done) {
        req('PUT', '/0/participants/1', {name: 'alice'})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });

      it('/3/participants/1', function (done) {
        req('PUT', '/3/participants/1', {name: 'alice'})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });

      it('/6/participants/1', function (done) {
        req('PUT', '/6/participants/1', {name: 'alice'})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });
    });

    context('409 409 FixedEventError', () => {
      it('/5/participants/1', function (done) {
        req('PUT', '/5/participants/1', {name: 'alice'})
          .expect(409, ERRORS.FIXED_EVENT_ERROR.json, done);
      });
    });

    context('404 ParticipantNotFoundError', () => {
      it('/4/participants/3', function (done) {
        req('PUT', '/4/participants/3', {name: 'alice'})
          .expect(404, ERRORS.PARTICIPANT_NOT_FOUND_ERROR.json, done);
      });

      it('/4/participants/6', function (done) {
        req('PUT', '/4/participants/6', {name: 'alice'})
          .expect(404, ERRORS.PARTICIPANT_NOT_FOUND_ERROR.json, done);
      });
    });

    context('409 DuplicatedParticipantError', () => {
      it('/4/participants/1 with existing name.', function (done) {
        req('PUT', '/4/participants/1', {name: 'bob'})
          .expect(409, ERRORS.DUPLICATED_PARTICIPANT_ERROR.json, done);
      });
    });

    context('200 OK', () => {
      it('/4/participants/1 with min length name.', function (done) {
        req('PUT', '/4/participants/1', {name: '1'})
          .expect(200, {
            id: 4, title: 'forth', description: 'forth_desc',
            terms: {},
            participants: {
              1: '1',
              2: 'bob',
              // 3 charlie was deleted
              4: 'dave',
              5: 'ellen'
            },
            record: {
              1: {},
              2: {},
              // 3 charlie was deleted
              4: {},
              5: {}
            },
            comments: {}
          }, done);
      });

      it('/4/participants/1 with min length name.', function (done) {
        req('PUT', '/4/participants/1', {name: dummyString(255)})
          .expect(200, {
            id: 4, title: 'forth', description: 'forth_desc',
            terms: {},
            participants: {
              1: dummyString(255),
              2: 'bob',
              // 3 charlie was deleted
              4: 'dave',
              5: 'ellen'
            },
            record: {
              1: {},
              2: {},
              // 3 charlie was deleted
              4: {},
              5: {}
            },
            comments: {}
          }, done);
      });

      it('/4/participants/1 with no params.', function (done) {
        req('PUT', '/4/participants/1', {})
          .expect(200, {
            id: 4, title: 'forth', description: 'forth_desc',
            terms: {},
            participants: {
              1: 'alice',
              2: 'bob',
              // 3 charlie was deleted
              4: 'dave',
              5: 'ellen'
            },
            record: {
              1: {},
              2: {},
              // 3 charlie was deleted
              4: {},
              5: {}
            },
            comments: {}
          }, done);
      });

      it('/4/participants/1 with name.', function (done) {
        req('PUT', '/4/participants/1', {name: 'alice_modified'})
          .expect(200, {
            id: 4, title: 'forth', description: 'forth_desc',
            terms: {},
            participants: {
              1: 'alice_modified',
              2: 'bob',
              // 3 charlie was deleted
              4: 'dave',
              5: 'ellen'
            },
            record: {
              1: {},
              2: {},
              // 3 charlie was deleted
              4: {},
              5: {}
            },
            comments: {}
          }, done);
      });

      it('/4/participants/1 with unmodified name.', function (done) {
        req('PUT', '/4/participants/1', {name: 'alice'})
          .expect(200, {
            id: 4, title: 'forth', description: 'forth_desc',
            terms: {},
            participants: {
              1: 'alice',
              2: 'bob',
              // 3 charlie was deleted
              4: 'dave',
              5: 'ellen'
            },
            record: {
              1: {},
              2: {},
              // 3 charlie was deleted
              4: {},
              5: {}
            },
            comments: {}
          }, done);
      });
    });
  });

  describe('DELETE', () => {
    context('404 NotFoundError', () => {
      it('/0/participants/1', function (done) {
        req('DELETE', '/0/participants/1', {})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });

      it('/3/participants/1', function (done) {
        req('DELETE', '/3/participants/1', {})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });

      it('/6/participants/1', function (done) {
        req('DELETE', '/6/participants/1', {})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });
    });

    context('409 FixedEventError', () => {
      it('/5/participants/1', function (done) {
        req('DELETE', '/5/participants/1', {})
          .expect(409, ERRORS.FIXED_EVENT_ERROR.json, done);
      });
    });

    context('404 ParticipantNotFoundError', () => {
      it('/4/participants/0', function (done) {
        req('DELETE', '/4/participants/0', {})
          .expect(404, ERRORS.PARTICIPANT_NOT_FOUND_ERROR.json, done);
      });

      it('/4/participants/6', function (done) {
        req('DELETE', '/4/participants/6', {})
          .expect(404, ERRORS.PARTICIPANT_NOT_FOUND_ERROR.json, done);
      });
    });

    context('200 OK', () => {
      it('/4/participants/3', function (done) {
        req('DELETE', '/4/participants/3', {})
          .expect(200, {
            id: 4, title: 'forth', description: 'forth_desc',
            terms: {},
            participants: {
              1: 'alice',
              2: 'bob',
              // 3 charlie was deleted
              4: 'dave',
              5: 'ellen'
            },
            record: {
              1: {},
              2: {},
              // 3 charlie was deleted
              4: {},
              5: {}
            },
            comments: {}
          }, done);
      });

      it('/4/participants/1', function (done) {
        req('DELETE', '/4/participants/1', {})
          .expect(200, {
            id: 4, title: 'forth', description: 'forth_desc',
            terms: {},
            participants: {
              2: 'bob',
              // 3 charlie was deleted
              4: 'dave',
              5: 'ellen'
            },
            record: {
              2: {},
              // 3 charlie was deleted
              4: {},
              5: {}
            },
            comments: {}
          }, done);
      });
    });
  });
});
