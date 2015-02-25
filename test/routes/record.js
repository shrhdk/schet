/*eslint strict:0*/

var mongo = require('../../lib/models/mongo');
var req = require('./../test-helper').req;

var term1 = '2014-01-01/2014-01-02';
var term2 = '2014-02-01/2014-02-02';
var term3 = '2014-01-01T00:00Z/2014-01-01T00:01Z';

describe('Record', function () {
    /* Initialize DB */
    beforeEach(function (done) {
        mongo.init({
            counters: [
                {id: 'events', seq: 2}
            ],
            events: [
                {
                    id: 1, title: 'first', description: 'first_desc',
                    terms: {
                        counter: 2,
                        1: term1,
                        2: term2
                    },
                    participants: {
                        counter: 2,
                        1: 'alice',
                        2: 'bob'
                    },
                    record: {
                        1: {
                            1: 'presence',
                            2: 'absence'
                        },
                        2: {
                            1: 'presence',
                            2: 'uncertain'
                        }
                    },
                    comments: {counter: 2}
                }
            ]
        }, function () {
            done();
        });
    });

    describe('Add Participant', function () {
        it('Add Participant with no Term ID', function (done) {
            req('POST', '/1/participants', {name: 'charlie'})
                .expect(201, {
                    id: 1, title: 'first', description: 'first_desc',
                    terms: {
                        1: term1,
                        2: term2
                    },
                    participants: {
                        1: 'alice',
                        2: 'bob',
                        3: 'charlie'        // new participant
                    },
                    record: {
                        1: {
                            1: 'presence',
                            2: 'absence'
                        },
                        2: {
                            1: 'presence',
                            2: 'uncertain'
                        },
                        3: {
                            1: 'absence',   // default value
                            2: 'absence'    // default value
                        }
                    },
                    comments: {}
                }, done);
        });

        it('Add Participant with all Term ID', function (done) {
            req('POST', '/1/participants', {name: 'charlie', 1: 'uncertain', 2: 'presence'})
                .expect(201, {
                    id: 1, title: 'first', description: 'first_desc',
                    terms: {
                        1: term1,
                        2: term2
                    },
                    participants: {
                        1: 'alice',
                        2: 'bob',
                        3: 'charlie'        // new participant
                    },
                    record: {
                        1: {
                            1: 'presence',
                            2: 'absence'
                        },
                        2: {
                            1: 'presence',
                            2: 'uncertain'
                        },
                        3: {
                            1: 'uncertain', // specific value
                            2: 'presence'   // specific value
                        }
                    },
                    comments: {}
                }, done);
        });

        it('Add Participant with Term ID', function (done) {
            req('POST', '/1/participants', {name: 'charlie', 1: 'uncertain'})
                .expect(201, {
                    id: 1, title: 'first', description: 'first_desc',
                    terms: {
                        1: term1,
                        2: term2
                    },
                    participants: {
                        1: 'alice',
                        2: 'bob',
                        3: 'charlie'        // new participant
                    },
                    record: {
                        1: {
                            1: 'presence',
                            2: 'absence'
                        },
                        2: {
                            1: 'presence',
                            2: 'uncertain'
                        },
                        3: {
                            1: 'uncertain', // specific value
                            2: 'absence'   // default value
                        }
                    },
                    comments: {}
                }, done);
        });

        it('Add Participant with Term ID which does not exist.', function (done) {
            req('POST', '/1/participants', {name: 'charlie', 1: 'uncertain', 2: 'presence', 3: 'absence'})
                .expect(201, {
                    id: 1, title: 'first', description: 'first_desc',
                    terms: {
                        1: term1,
                        2: term2
                    },
                    participants: {
                        1: 'alice',
                        2: 'bob',
                        3: 'charlie'        // new participant
                    },
                    record: {
                        1: {
                            1: 'presence',
                            2: 'absence'
                            // 3: 'absence' is ignored
                        },
                        2: {
                            1: 'presence',
                            2: 'uncertain'
                            // 3: 'absence' is ignored
                        },
                        3: {
                            1: 'uncertain', // specific value
                            2: 'presence'   // specific value
                            // 3: 'absence' is ignored
                        }
                    },
                    comments: {}
                }, done);
        });
    });

    describe('Update Participant', function () {
        it('Update Participant with no Term ID', function (done) {
            req('PUT', '/1/participants/1', {name: 'modified'})
                .expect(200, {
                    id: 1, title: 'first', description: 'first_desc',
                    terms: {
                        1: term1,
                        2: term2
                    },
                    participants: {
                        1: 'modified',
                        2: 'bob'
                    },
                    record: {
                        1: {
                            1: 'presence',
                            2: 'absence'
                        },
                        2: {
                            1: 'presence',
                            2: 'uncertain'
                        }
                    },
                    comments: {}
                }, done);
        });

        it('Update Participant without name', function (done) {
            req('PUT', '/1/participants/1', {1: 'uncertain'})
                .expect(200, {
                    id: 1, title: 'first', description: 'first_desc',
                    terms: {
                        1: term1,
                        2: term2
                    },
                    participants: {
                        1: 'alice',
                        2: 'bob'
                    },
                    record: {
                        1: {
                            1: 'uncertain',
                            2: 'absence'
                        },
                        2: {
                            1: 'presence',
                            2: 'uncertain'
                        }
                    },
                    comments: {}
                }, done);
        });

        it('Update Participant with all Term ID', function (done) {
            req('PUT', '/1/participants/1', {name: 'modified', 1: 'uncertain', 2: 'presence'})
                .expect(200, {
                    id: 1, title: 'first', description: 'first_desc',
                    terms: {
                        1: term1,
                        2: term2
                    },
                    participants: {
                        1: 'modified',      // modified
                        2: 'bob'
                    },
                    record: {
                        1: {
                            1: 'uncertain', // modified
                            2: 'presence'   // modified
                        },
                        2: {
                            1: 'presence',
                            2: 'uncertain'
                        }
                    },
                    comments: {}
                }, done);
        });

        it('Update Participant with Term ID', function (done) {
            req('PUT', '/1/participants/1', {name: 'modified', 1: 'uncertain'})
                .expect(200, {
                    id: 1, title: 'first', description: 'first_desc',
                    terms: {
                        1: term1,
                        2: term2
                    },
                    participants: {
                        1: 'modified',          // modified
                        2: 'bob'
                    },
                    record: {
                        1: {
                            1: 'uncertain',     // modified
                            2: 'absence'
                        },
                        2: {
                            1: 'presence',
                            2: 'uncertain'
                        }
                    },
                    comments: {}
                }, done);
        });

        it('Update Participant with Term ID which does not exist.', function (done) {
            req('PUT', '/1/participants/1', {name: 'modified', 1: 'uncertain', 2: 'presence', 3: 'absence'})
                .expect(200, {
                    id: 1, title: 'first', description: 'first_desc',
                    terms: {
                        1: term1,
                        2: term2
                    },
                    participants: {
                        1: 'modified',      // modified
                        2: 'bob'
                    },
                    record: {
                        1: {
                            1: 'uncertain', // modified
                            2: 'presence'   // modified
                            // 3: 'absence' is ignored
                        },
                        2: {
                            1: 'presence',
                            2: 'uncertain'
                        }
                    },
                    comments: {}
                }, done);
        });
    });

    describe('Delete Participant', function () {
        it('Delete Participant', function (done) {
            req('DELETE', '/1/participants/1', {})
                .expect(200, {
                    id: 1, title: 'first', description: 'first_desc',
                    terms: {
                        1: term1,
                        2: term2
                    },
                    participants: {
                        // 1: 'alice' is deleted
                        2: 'bob'
                    },
                    record: {
                        // 1: {alice's record} is deleted
                        2: {
                            1: 'presence',
                            2: 'uncertain'
                        }
                    },
                    comments: {}
                }, done);
        });
    });

    describe('Add Term', function () {
        it('Add Term', function (done) {
            req('POST', '/1/terms', {term: term3})
                .expect(201, {
                    id: 1, title: 'first', description: 'first_desc',
                    terms: {
                        1: term1,
                        2: term2,
                        3: term3    // new Term
                    },
                    participants: {
                        1: 'alice',
                        2: 'bob'
                    },
                    record: {
                        1: {
                            1: 'presence',
                            2: 'absence',
                            3: 'absence'    // default value
                        },
                        2: {
                            1: 'presence',
                            2: 'uncertain',
                            3: 'absence'    // default value
                        }
                    },
                    comments: {}
                }, done);
        });
    });

    describe('Delete Term', function () {
        it('Delete Term', function (done) {
            req('DELETE', '/1/terms/1', {})
                .expect(200, {
                    id: 1, title: 'first', description: 'first_desc',
                    terms: {
                        // 1: term1 is deleted
                        2: term2
                    },
                    participants: {
                        1: 'alice',
                        2: 'bob'
                    },
                    record: {
                        1: {
                            // 1: record for term1 is deleted
                            2: 'absence'
                        },
                        2: {
                            // 1: record for term1 is deleted
                            2: 'uncertain'
                        }
                    },
                    comments: {}
                }, done);
        });
    });
});
