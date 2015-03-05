/*eslint strict:0*/

var async = require('async');
var ERRORS = require('../../src/errors');
var mongo = require('../../src/models/mongo');
var testHelper = require('./../test-helper');
var req = testHelper.req;
var dummyString = testHelper.dummyString;
var form = require('../../src/util/form');

var term1 = '2014-01-01/2014-01-02';
var term2 = '2014-02-01/2014-02-02';
var term3 = '2014-01-01T00:00Z/2014-01-01T00:01Z';

describe('Event', () => {
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
            counter: 4,
            1: term1,
            2: term2,
            // third acts as deleted Term
            4: term3
          },
          participants: {counter: 0},
          record: {},
          comments: {counter: 0}
        },
        {
          // Fixed event
          id: 5, title: 'fifth', description: 'fifth_desc', fixed: 1,
          terms: {
            counter: 4,
            1: term1,
            2: term2,
            // third acts as deleted Term
            4: term3
          },
          participants: {counter: 0},
          record: {},
          comments: {counter: 0}
        }
      ]
    }, done);
  });

  describe('POST', () => {
    context('400', () => {
      it('/ with no params.', function (done) {
        req('POST', '/', {})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/ without title.', function (done) {
        req('POST', '/', {description: 'foo'})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/ with empty title.', function (done) {
        req('POST', '/', {title: ''})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/ with title consists of white space characters.', function (done) {
        req('POST', '/', {title: form.WHITE_SPACE})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/ with title contains \\r.', function (done) {
        req('POST', '/', {title: 'hello\rworld'})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/ with title contains \\n.', function (done) {
        req('POST', '/', {title: 'hello\nworld'})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/ with title contains \\r\\n.', function (done) {
        req('POST', '/', {title: 'hello\r\nworld'})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/ with too long title.', function (done) {
        req('POST', '/', {title: dummyString(256)})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/ with too long description.', function (done) {
        req('POST', '/', {title: 'title', description: dummyString(2049)})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });
    });

    context('201', () => {
      it('/ with min length title.', function (done) {
        async.series([
          function (next) {
            mongo.init({
              counters: [
                {id: 'events', seq: 0}
              ]
            }, next);
          },
          function (next) {
            req('POST', '/', {title: '1'})
              .expect(201, {
                id: 1,
                title: '1',
                description: '',
                terms: {},
                participants: {},
                record: {},
                comments: {}
              }, next);
          }
        ], done);
      });

      it('/ with max length title.', function (done) {
        async.series([
          function (next) {
            mongo.init({
              counters: [
                {id: 'events', seq: 0}
              ]
            }, next);
          },
          function (next) {
            req('POST', '/', {title: dummyString(255)})
              .expect(201, {
                id: 1,
                title: dummyString(255),
                description: '',
                terms: {},
                participants: {},
                record: {},
                comments: {}
              }, next);
          }
        ], done);
      });

      it('/ with min length description.', function (done) {
        async.series([
          function (next) {
            mongo.init({
              counters: [
                {id: 'events', seq: 0}
              ]
            }, next);
          },
          function (next) {
            req('POST', '/', {title: 'title', description: ''})
              .expect(201, {
                id: 1,
                title: 'title',
                description: '',
                terms: {},
                participants: {},
                record: {},
                comments: {}
              }, next);
          }
        ], done);
      });

      it('/ with max length description.', function (done) {
        async.series([
          function (next) {
            mongo.init({
              counters: [
                {id: 'events', seq: 0}
              ]
            }, next);
          },
          function (next) {
            req('POST', '/', {title: 'title', description: dummyString(2048)})
              .expect(201, {
                id: 1,
                title: 'title',
                description: dummyString(2048),
                terms: {},
                participants: {},
                record: {},
                comments: {}
              }, next);
          }
        ], done);
      });

      it('/ without description.', function (done) {
        async.series([
          function (next) {
            mongo.init({
              counters: [
                {id: 'events', seq: 0}
              ]
            }, next);
          },
          function (next) {
            req('POST', '/', {title: 'title'})
              .expect(201, {
                id: 1,
                title: 'title',
                description: '',
                terms: {},
                participants: {},
                record: {},
                comments: {}
              }, next);
          }
        ], done);
      });

      it('/ with empty description.', function (done) {
        async.series([
          function (next) {
            mongo.init({
              counters: [
                {id: 'events', seq: 0}
              ]
            }, next);
          },
          function (next) {
            req('POST', '/', {title: 'title', description: ''})
              .expect(201, {
                id: 1,
                title: 'title',
                description: '',
                terms: {},
                participants: {},
                record: {},
                comments: {}
              }, next);
          }
        ], done);
      });
    });

    context('201 (Increment ID per creation)', () => {
      it('/ with title and description should return id=1,2,3,... per request from initial state.', function (done) {
        async.series([
          function (next) {
            mongo.init({
              counters: [
                {id: 'events', seq: 0}
              ]
            }, next);
          },
          function (next) {
            req('POST', '/', {title: 'first', description: 'first_desc', terms: {}})
              .expect(201, {
                id: 1,
                title: 'first',
                description: 'first_desc',
                terms: {},
                participants: {},
                record: {},
                comments: {}
              }, next);
          },
          function (next) {
            req('POST', '/', {title: 'second', description: 'second_desc'})
              .expect(201, {
                id: 2,
                title: 'second',
                description: 'second_desc',
                terms: {},
                participants: {},
                record: {},
                comments: {}
              }, next);
          },
          function (next) {
            req('POST', '/', {title: 'third', description: 'third_desc'})
              .expect(201, {
                id: 3,
                title: 'third',
                description: 'third_desc',
                terms: {},
                participants: {},
                record: {},
                comments: {}
              }, next);
          }
        ], done);
      });

      it('/ with title and description should return id=6', function (done) {
        req('POST', '/', {title: 'sixth', description: 'sixth_desc'})
          .expect(201, {
            id: 6,
            title: 'sixth',
            description: 'sixth_desc',
            terms: {},
            participants: {},
            record: {},
            comments: {}
          }, done);
      });
    });
  });

  describe('GET', () => {
    context('404', () => {
      it('/0', function (done) {
        req('GET', '/0', {})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });

      it('/3', function (done) {
        req('GET', '/3', {})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });

      it('/6', function (done) {
        req('GET', '/6', {})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });
    });

    context('200', () => {
      it('/1 should return first data.', function (done) {
        req('GET', '/1', {})
          .expect(200, {
            id: 1, title: 'first', description: 'first_desc',
            terms: {},
            participants: {},
            record: {},
            comments: {}
          }, done);
      });

      it('/2 should return second data.', function (done) {
        req('GET', '/2', {})
          .expect(200, {
            id: 2, title: 'second', description: 'second_desc',
            terms: {},
            participants: {},
            record: {},
            comments: {}
          }, done);
      });
    });
  });

  describe('PUT', () => {
    context('400', () => {
      it('/1 with empty title.', function (done) {
        req('PUT', '/1', {title: ''})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1 with title consists of white space characters.', function (done) {
        req('PUT', '/1', {title: form.WHITE_SPACE})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1 with title contains \\r.', function (done) {
        req('PUT', '/1', {title: 'hello\rworld'})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1 with title contains \\n.', function (done) {
        req('PUT', '/1', {title: 'hello\nworld'})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1 with title contains \\r\\n.', function (done) {
        req('PUT', '/1', {title: 'hello\r\nworld'})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1 with too long title.', function (done) {
        req('PUT', '/1', {title: dummyString(256)})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/1 with too long description.', function (done) {
        req('PUT', '/1', {description: dummyString(2049)})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });
    });

    context('404', () => {
      it('/0', function (done) {
        req('PUT', '/0', {})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });

      it('/3', function (done) {
        req('PUT', '/3', {})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });

      it('/6', function (done) {
        req('PUT', '/6', {})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });
    });

    context('200', () => {
      it('/1 with no params.', function (done) {
        req('PUT', '/1', {})
          .expect(200, {
            id: 1, title: 'first', description: 'first_desc',
            terms: {},
            participants: {},
            record: {},
            comments: {}
          }, done);
      });

      it('/1 with title.', function (done) {
        req('PUT', '/1', {title: 'modified'})
          .expect(200, {
            id: 1, title: 'modified', description: 'first_desc',
            terms: {},
            participants: {},
            record: {},
            comments: {}
          }, done);
      });

      it('/1 with min length title.', function (done) {
        req('PUT', '/1', {title: '1'})
          .expect(200, {
            id: 1, title: '1', description: 'first_desc',
            terms: {},
            participants: {},
            record: {},
            comments: {}
          }, done);
      });

      it('/1 with max length title.', function (done) {
        req('PUT', '/1', {title: dummyString(255)})
          .expect(200, {
            id: 1, title: dummyString(255), description: 'first_desc',
            terms: {},
            participants: {},
            record: {},
            comments: {}
          }, done);
      });

      it('/1 with min length description.', function (done) {
        req('PUT', '/1', {title: 'modified', description: ''})
          .expect(200, {
            id: 1, title: 'modified', description: '',
            terms: {},
            participants: {},
            record: {},
            comments: {}
          }, done);
      });

      it('/1 with max length description.', function (done) {
        req('PUT', '/1', {title: 'modified', description: dummyString(2048)})
          .expect(200, {
            id: 1, title: 'modified', description: dummyString(2048),
            terms: {},
            participants: {},
            record: {},
            comments: {}
          }, done);
      });

      it('/1 with title and description.', function (done) {
        req('PUT', '/1', {title: 'modified_title', description: 'modified_desc'})
          .expect(200, {
            id: 1,
            title: 'modified_title',
            description: 'modified_desc',
            terms: {},
            participants: {},
            record: {},
            comments: {}
          }, done);
      });
    });
  });

  describe('PUT (fixed event)', () => {

    context('400', () => {
      it('/5 with empty title.', function (done) {
        req('PUT', '/5', {title: ''})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });

      it('/5 with title consists of white space characters.', function (done) {
        req('PUT', '/5', {title: form.WHITE_SPACE})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });
    });

    context('409', () => {
      it('/5 with no params.', function (done) {
        req('PUT', '/5', {})
          .expect(409, ERRORS.FIXED_EVENT_ERROR.json, done);
      });

      it('/5 with title.', function (done) {
        req('PUT', '/5', {title: 'modified'})
          .expect(409, ERRORS.FIXED_EVENT_ERROR.json, done);
      });

      it('/5 with description.', function (done) {
        req('PUT', '/5', {description: 'modified'})
          .expect(409, ERRORS.FIXED_EVENT_ERROR.json, done);
      });

      it('/5 with title and description.', function (done) {
        req('PUT', '/5', {title: 'modified_title', description: 'modified_desc'})
          .expect(409, ERRORS.FIXED_EVENT_ERROR.json, done);
      });
    });
  });

  describe('PUT (fix event)', () => {
    context('400', () => {
      it('/4 with invalid TermID.', function (done) {
        req('PUT', '/4', {fixed: 0})
          .expect(400, ERRORS.INVALID_PARAMETER_ERROR.json, done);
      });
    });

    context('409', () => {
      it('/5 with valid TermID.', function (done) {
        req('PUT', '/5', {fixed: 1})
          .expect(409, ERRORS.FIXED_EVENT_ERROR.json, done);
      });
    });

    context('409', () => {
      it('/4 with deleted TermID.', function (done) {
        req('PUT', '/4', {fixed: 3})
          .expect(409, ERRORS.TERM_NOT_FOUND_ERROR.json, done);
      });

      it('/4 with future TermID.', function (done) {
        req('PUT', '/4', {fixed: 5})
          .expect(409, ERRORS.TERM_NOT_FOUND_ERROR.json, done);
      });
    });

    context('200', () => {
      it('/4 with valid TermID.', function (done) {
        req('PUT', '/4', {fixed: 1})
          .expect(200, {
            id: 4, title: 'forth', description: 'forth_desc', fixed: 1,
            terms: {
              1: term1,
              2: term2,
              // third acts as deleted Term
              4: term3
            },
            participants: {},
            record: {},
            comments: {}
          }, done);
      });
    });
  });

  describe('PUT (unfix event)', () => {
    context('200', () => {
      it('/5 with empty TermID.', function (done) {
        req('PUT', '/5', {fixed: ''})
          .expect(200, {
            id: 5, title: 'fifth', description: 'fifth_desc',
            terms: {
              1: term1,
              2: term2,
              // third acts as deleted Term
              4: term3
            },
            participants: {},
            record: {},
            comments: {}
          }, done);
      });
    });
  });

  describe('DELETE', () => {
    context('404', () => {
      it('/0', function (done) {
        req('DELETE', '/0', {})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });

      it('/6', function (done) {
        req('DELETE', '/6', {})
          .expect(404, ERRORS.NOT_FOUND_ERROR.json, done);
      });
    });

    context('204 No Content', () => {
      it('/1', function (done) {
        req('DELETE', '/1', {})
          .expect(204, undefined, done);
      });

      it('/3', function (done) {
        req('DELETE', '/3', {})
          .expect(204, undefined, done);
      });
    });
  });
});
