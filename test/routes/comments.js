/*eslint strict:0*/

var errors = require('../../lib/errors');
var async = require('async');
var mongo = require('../../lib/models/mongo');
var testHelper = require('./../test-helper');
var req = testHelper.req;
var dummyString = testHelper.dummyString;

var ALICE_COMMENT = Object.freeze({name: 'alice', body: 'alice_comment'});
var BOB_COMMENT = Object.freeze({name: 'bob', body: 'bob_comment'});
var CHARLIE_COMMENT = Object.freeze({name: 'charlie', body: 'charlie_comment'});
var DAVE_COMMENT = Object.freeze({name: 'dave', body: 'dave_comment'});
var ELLEN_COMMENT = Object.freeze({name: 'ellen', body: 'ellen_comment'});
var FRANK_COMMENT = Object.freeze({name: 'frank', body: 'frank_comment'});
var MODIFIED_COMMENT = Object.freeze({name: 'modified_name', body: 'modified_comment'});

describe('Comment', function () {
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
                    participants: {counter: 0},
                    record: {},
                    comments: {
                        counter: 5,
                        1: ALICE_COMMENT,
                        2: BOB_COMMENT,
                        // 3 charlie's comment acts as deleted
                        4: DAVE_COMMENT,
                        5: ELLEN_COMMENT
                    }
                },
                {
                    // Fixed event
                    id: 5, title: 'fifth', description: 'fifth_desc', fixed: 1,
                    terms: {counter: 0},
                    participants: {counter: 0},
                    record: {},
                    comments: {
                        counter: 1,
                        1: ALICE_COMMENT
                    }
                }
            ]
        }, function () {
            done();
        });
    });

    describe('POST', function () {
        context('400 InvalidParameterError', function () {
            it('/1/comments with no params.', function (done) {
                req('POST', '/1/comments', {})
                    .expect(400, {error: 'InvalidParameterError'}, done);
            });

            it('/1/comments without name.', function (done) {
                req('POST', '/1/comments', {body: 'body'})
                    .expect(400, {error: 'InvalidParameterError'}, done);
            });

            it('/1/comments with name consists of whitespace.', function (done) {
                req('POST', '/1/comments', {name: ' ', body: 'body'})
                    .expect(400, {error: 'InvalidParameterError'}, done);
            });

            it('/1/comments with name contains \\r.', function (done) {
                req('POST', '/1/comments', {name: 'hello\rworld', body: 'body'})
                    .expect(400, {error: 'InvalidParameterError'}, done);
            });

            it('/1/comments with name contains \\n.', function (done) {
                req('POST', '/1/comments', {name: 'hello\nworld', body: 'body'})
                    .expect(400, {error: 'InvalidParameterError'}, done);
            });

            it('/1/comments with name contains \\r\\n.', function (done) {
                req('POST', '/1/comments', {name: 'hello\r\nworld', body: 'body'})
                    .expect(400, {error: 'InvalidParameterError'}, done);
            });

            it('/1/comments with too long name.', function (done) {
                req('POST', '/1/comments', {name: dummyString(256), body: 'body'})
                    .expect(400, {error: 'InvalidParameterError'}, done);
            });

            it('/1/comments without body.', function (done) {
                req('POST', '/1/comments', {name: 'name'})
                    .expect(400, {error: 'InvalidParameterError'}, done);
            });

            it('/1/comments with body consists of whitespace.', function (done) {
                req('POST', '/1/comments', {name: 'name', body: ' '})
                    .expect(400, {error: 'InvalidParameterError'}, done);
            });

            it('/1/comments with body consists of whitespace.', function (done) {
                req('POST', '/1/comments', {name: 'name', body: ' '})
                    .expect(400, {error: 'InvalidParameterError'}, done);
            });

            it('/1/comments with too long name.', function (done) {
                req('POST', '/1/comments', {name: 'name', body: dummyString(2049)})
                    .expect(400, {error: 'InvalidParameterError'}, done);
            });
        });

        context('404 NotFoundError', function () {
            it('/0/comments.', function (done) {
                req('POST', '/0/comments', ALICE_COMMENT)
                    .expect(404, {error: 'NotFoundError'}, done);
            });

            it('/6/comments', function (done) {
                req('POST', '/6/comments', ALICE_COMMENT)
                    .expect(404, {error: 'NotFoundError'}, done);
            });
        });

        context('410 NotFoundError', function () {
            it('/3/comments.', function (done) {
                req('POST', '/3/comments', ALICE_COMMENT)
                    .expect(410, {error: 'NotFoundError'}, done);
            });
        });

        context('201 Created', function () {
            it('/1/comments with min length name.', function (done) {
                req('POST', '/1/comments', {name: '1', body: 'body'})
                    .expect(201, {
                        id: 1, title: 'first', description: 'first_desc',
                        terms: {},
                        participants: {},
                        record: {},
                        comments: {
                            1: {name: '1', body: 'body'}
                        }
                    }, done);
            });

            it('/1/comments with max length name.', function (done) {
                req('POST', '/1/comments', {name: dummyString(255), body: 'body'})
                    .expect(201, {
                        id: 1, title: 'first', description: 'first_desc',
                        terms: {},
                        participants: {},
                        record: {},
                        comments: {
                            1: {name: dummyString(255), body: 'body'}
                        }
                    }, done);
            });

            it('/1/comments with min length body.', function (done) {
                req('POST', '/1/comments', {name: 'name', body: '1'})
                    .expect(201, {
                        id: 1, title: 'first', description: 'first_desc',
                        terms: {},
                        participants: {},
                        record: {},
                        comments: {
                            1: {name: 'name', body: '1'}
                        }
                    }, done);
            });

            it('/1/comments with max length body.', function (done) {
                req('POST', '/1/comments', {name: 'name', body: dummyString(2048)})
                    .expect(201, {
                        id: 1, title: 'first', description: 'first_desc',
                        terms: {},
                        participants: {},
                        record: {},
                        comments: {
                            1: {name: 'name', body: dummyString(2048)}
                        }
                    }, done);
            });

            it('/5/comments should return 201.', function (done) {
                req('POST', '/5/comments', BOB_COMMENT)
                    .expect(201, {
                        id: 5, title: 'fifth', description: 'fifth_desc', fixed: 1,
                        terms: {},
                        participants: {},
                        record: {},
                        comments: {
                            1: ALICE_COMMENT,
                            2: BOB_COMMENT
                        }
                    }, done);
            });
        });

        context('201 Created (Increment ID per creation)', function () {
            it('/1/comments should return commentID=1,2,3,... per request', function (done) {
                async.series([
                    function (next) {
                        req('POST', '/1/comments', ALICE_COMMENT)
                            .expect(201, {
                                id: 1, title: 'first', description: 'first_desc',
                                terms: {},
                                participants: {},
                                record: {},
                                comments: {
                                    1: ALICE_COMMENT
                                }
                            }, next);
                    },
                    function (next) {
                        req('POST', '/1/comments', BOB_COMMENT)
                            .expect(201, {
                                id: 1, title: 'first', description: 'first_desc',
                                terms: {},
                                participants: {},
                                record: {},
                                comments: {
                                    1: ALICE_COMMENT,
                                    2: BOB_COMMENT
                                }
                            }, next);
                    },
                    function (next) {
                        req('POST', '/1/comments', CHARLIE_COMMENT)
                            .expect(201, {
                                id: 1, title: 'first', description: 'first_desc',
                                terms: {},
                                participants: {},
                                record: {},
                                comments: {
                                    1: ALICE_COMMENT,
                                    2: BOB_COMMENT,
                                    3: CHARLIE_COMMENT
                                }
                            }, next);
                    }
                ], done);
            });

            it('/4/comments should return commentID=6', function (done) {
                req('POST', '/4/comments', FRANK_COMMENT)
                    .expect(201, {
                        id: 4, title: 'forth', description: 'forth_desc',
                        terms: {},
                        participants: {},
                        record: {},
                        comments: {
                            1: ALICE_COMMENT,
                            2: BOB_COMMENT,
                            // 3 charlie's comment acts as deleted
                            4: DAVE_COMMENT,
                            5: ELLEN_COMMENT,
                            6: FRANK_COMMENT
                        }
                    }, done);
            });
        });
    });

    describe('PUT', function () {
        context('400 InvalidParameterError', function () {
            it('/4/comments/1 with name consists of whitespace.', function (done) {
                req('PUT', '/4/comments/1', {name: ' '})
                    .expect(400, {error: 'InvalidParameterError'}, done);
            });

            it('/4/comments/1 with name contains \\r.', function (done) {
                req('PUT', '/4/comments/1', {name: 'hello\rworld'})
                    .expect(400, {error: 'InvalidParameterError'}, done);
            });

            it('/4/comments/1 with name contains \\n.', function (done) {
                req('PUT', '/4/comments/1', {name: 'hello\nworld'})
                    .expect(400, {error: 'InvalidParameterError'}, done);
            });

            it('/4/comments/1 with name contains \\r\\n.', function (done) {
                req('PUT', '/4/comments/1', {name: 'hello\r\nworld'})
                    .expect(400, {error: 'InvalidParameterError'}, done);
            });

            it('/4/comments/1 with too long name.', function (done) {
                req('PUT', '/4/comments/1', {name: dummyString(256)})
                    .expect(400, {error: 'InvalidParameterError'}, done);
            });

            it('/4/comments/1 with body consists of whitespace.', function (done) {
                req('PUT', '/4/comments/1', {body: ' '})
                    .expect(400, {error: 'InvalidParameterError'}, done);
            });

            it('/4/comments/1 with too long name.', function (done) {
                req('PUT', '/4/comments/1', {body: dummyString(2049)})
                    .expect(400, {error: 'InvalidParameterError'}, done);
            });
        });

        context('404 NotFoundError', function () {
            it('/0/comments/1', function (done) {
                req('PUT', '/0/comments/1', MODIFIED_COMMENT)
                    .expect(404, {error: 'NotFoundError'}, done);
            });

            it('/6/comments/1', function (done) {
                req('PUT', '/6/comments/1', MODIFIED_COMMENT)
                    .expect(404, {error: 'NotFoundError'}, done);
            });
        });

        context('410 NotFoundError', function () {
            it('/3/comments/1', function (done) {
                req('PUT', '/3/comments/1', MODIFIED_COMMENT)
                    .expect(410, {error: 'NotFoundError'}, done);
            });
        });

        context('404 CommentNotFoundError', function () {
            it('/4/comments/0', function (done) {
                req('PUT', '/4/comments/0', MODIFIED_COMMENT)
                    .expect(404, {error: 'CommentNotFoundError'}, done);
            });

            it('/4/comments/6', function (done) {
                req('PUT', '/4/comments/6', MODIFIED_COMMENT)
                    .expect(404, {error: 'CommentNotFoundError'}, done);
            });
        });

        context('410 CommentNotFoundError', function () {
            it('/4/comments/3', function (done) {
                req('PUT', '/4/comments/3', MODIFIED_COMMENT)
                    .expect(410, {error: 'CommentNotFoundError'}, done);
            });
        });

        context('200 OK', function () {
            it('/4/comments/1 with no params', function (done) {
                req('PUT', '/4/comments/1', {})
                    .expect(200, {
                        id: 4, title: 'forth', description: 'forth_desc',
                        terms: {}, participants: {}, record: {},
                        comments: {
                            1: ALICE_COMMENT,
                            2: BOB_COMMENT,
                            // 3 charlie's comment acts as deleted
                            4: DAVE_COMMENT,
                            5: ELLEN_COMMENT
                        }
                    }, done);
            });

            it('/4/comments/1 with min length name.', function (done) {
                req('PUT', '/4/comments/1', {name: '1', body: 'body'})
                    .expect(200, {
                        id: 4, title: 'forth', description: 'forth_desc',
                        terms: {}, participants: {}, record: {},
                        comments: {
                            1: {name: '1', body: 'body'},
                            2: BOB_COMMENT,
                            // 3 charlie's comment acts as deleted
                            4: DAVE_COMMENT,
                            5: ELLEN_COMMENT
                        }
                    }, done);
            });

            it('/4/comments with max length name.', function (done) {
                req('PUT', '/4/comments/1', {name: dummyString(255), body: 'body'})
                    .expect(200, {
                        id: 4, title: 'forth', description: 'forth_desc',
                        terms: {}, participants: {}, record: {},
                        comments: {
                            1: {name: dummyString(255), body: 'body'},
                            2: BOB_COMMENT,
                            // 3 charlie's comment acts as deleted
                            4: DAVE_COMMENT,
                            5: ELLEN_COMMENT
                        }
                    }, done);
            });

            it('/4/comments/1 with min length body.', function (done) {
                req('PUT', '/4/comments/1', {name: 'name', body: '1'})
                    .expect(200, {
                        id: 4, title: 'forth', description: 'forth_desc',
                        terms: {}, participants: {}, record: {},
                        comments: {
                            1: {name: 'name', body: '1'},
                            2: BOB_COMMENT,
                            // 3 charlie's comment acts as deleted
                            4: DAVE_COMMENT,
                            5: ELLEN_COMMENT
                        }
                    }, done);
            });

            it('/4/comments/1 with max length body.', function (done) {
                req('PUT', '/4/comments/1', {name: 'name', body: dummyString(2048)})
                    .expect(200, {
                        id: 4, title: 'forth', description: 'forth_desc',
                        terms: {},
                        participants: {},
                        record: {},
                        comments: {
                            1: {name: 'name', body: dummyString(2048)},
                            2: BOB_COMMENT,
                            // 3 charlie's comment acts as deleted
                            4: DAVE_COMMENT,
                            5: ELLEN_COMMENT
                        }
                    }, done);
            });

            it('/5/comments/1 with name and body.', function (done) {
                req('PUT', '/5/comments/1', MODIFIED_COMMENT)
                    .expect(200, {
                        id: 5, title: 'fifth', description: 'fifth_desc', fixed: 1,
                        terms: {}, participants: {}, record: {},
                        comments: {
                            1: MODIFIED_COMMENT
                        }
                    }, done);
            });

            it('/4/comments/1 with name.', function (done) {
                req('PUT', '/4/comments/1', {name: 'modified'})
                    .expect(200, {
                        id: 4, title: 'forth', description: 'forth_desc',
                        terms: {}, participants: {}, record: {},
                        comments: {
                            1: {name: 'modified', body: 'alice_comment'},
                            2: BOB_COMMENT,
                            // 3 charlie's comment acts as deleted
                            4: DAVE_COMMENT,
                            5: ELLEN_COMMENT
                        }
                    }, done);
            });

            it('/4/comments/1 with body.', function (done) {
                req('PUT', '/4/comments/1', {body: 'modified'})
                    .expect(200, {
                        id: 4, title: 'forth', description: 'forth_desc',
                        terms: {}, participants: {}, record: {},
                        comments: {
                            1: {name: 'alice', body: 'modified'},
                            2: BOB_COMMENT,
                            // 3 charlie's comment acts as deleted
                            4: DAVE_COMMENT,
                            5: ELLEN_COMMENT
                        }
                    }, done);
            });

            it('/4/comments/1 with name and body.', function (done) {
                req('PUT', '/4/comments/1', MODIFIED_COMMENT)
                    .expect(200, {
                        id: 4, title: 'forth', description: 'forth_desc',
                        terms: {}, participants: {}, record: {},
                        comments: {
                            1: MODIFIED_COMMENT,
                            2: BOB_COMMENT,
                            // 3 charlie's comment acts as deleted
                            4: DAVE_COMMENT,
                            5: ELLEN_COMMENT
                        }
                    }, done);
            });
        });
    });

    describe('DELETE', function () {
        context('404 NotFoundError', function () {
            it('/0/comments/1', function (done) {
                req('DELETE', '/0/comments/1', {})
                    .expect(404, {error: 'NotFoundError'}, done);
            });

            it('/6/comments/1', function (done) {
                req('DELETE', '/6/comments/1', {})
                    .expect(404, {error: 'NotFoundError'}, done);
            });
        });

        context('410 NotFoundError', function () {
            it('/3/comments/1', function (done) {
                req('DELETE', '/3/comments/1', {})
                    .expect(410, {error: 'NotFoundError'}, done);
            });
        });

        context('404 CommentNotFoundError', function () {
            it('/4/comments/0', function (done) {
                req('DELETE', '/4/comments/0', {})
                    .expect(404, {error: 'CommentNotFoundError'}, done);
            });

            it('/4/comments/6', function (done) {
                req('DELETE', '/4/comments/6', {})
                    .expect(404, {error: 'CommentNotFoundError'}, done);
            });
        });

        context('200 OK', function () {
            it('/5/comments/1', function (done) {
                req('DELETE', '/5/comments/1', {})
                    .expect(200, {
                        id: 5, title: 'fifth', description: 'fifth_desc', fixed: 1,
                        terms: {},
                        participants: {},
                        record: {},
                        comments: {
                            // alice's comment is deleted.
                        }
                    }, done);
            });

            it('/4/comments/3', function (done) {
                req('DELETE', '/4/comments/3', {})
                    .expect(200, {
                        id: 4, title: 'forth', description: 'forth_desc',
                        terms: {},
                        participants: {},
                        record: {},
                        comments: {
                            1: ALICE_COMMENT,
                            2: BOB_COMMENT,
                            // 3 charlie's comment acts as deleted
                            4: DAVE_COMMENT,
                            5: ELLEN_COMMENT
                        }
                    }, done);
            });

            it('/4/comments/1', function (done) {
                req('DELETE', '/4/comments/1', {})
                    .expect(200, {
                        id: 4, title: 'forth', description: 'forth_desc',
                        terms: {},
                        participants: {},
                        record: {},
                        comments: {
                            2: BOB_COMMENT,
                            // 3 charlie's comment acts as deleted
                            4: DAVE_COMMENT,
                            5: ELLEN_COMMENT
                        }
                    }, done);
            });
        });
    });
});
