var util = require('util');

var errors = require('../errors');
var mongo = require('./mongo');

// Event

/**
 * Create Event
 * @param {!string} title
 * @param {!string} description
 * @param {!function(Error, Object)} cb
 */
exports.create = function (title, description, cb) {
    'use strict';

    var data = {
        title: title,
        description: description,
        terms: {counter: 0},
        participants: {counter: 0},
        record: {},
        comments: {counter: 0}
    };

    return mongo.create('events', data, function (err, event) {
        if (err || event === null) {
            return cb(err, null);
        }

        delete event.terms.counter;
        delete event.participants.counter;
        delete event.comments.counter;

        return cb(null, event);
    });
};

/**
 * Get Event
 * @param {!number} id
 * @param {!function(Error, Object)} cb
 */
exports.get = function (id, cb) {
    'use strict';

    id = Number(id);

    return mongo.read('events', id, function (err, event) {
        if (err || event === null) {
            return cb(err, null);
        }

        delete event.terms.counter;
        delete event.participants.counter;
        delete event.comments.counter;

        return cb(null, event);
    });
};

/**
 * Update, Fix or Unfix Event
 * @param {!number} id
 * @param {!Object} data
 * @param {!function(Error, Object)} cb
 */
exports.put = function (id, data, cb) {
    'use strict';

    id = Number(id);

    if ('fixed' in data) {
        if ('title' in data || 'description' in data) {
            return cb(new errors.InvalidParameterError(), null);
        }

        if (data.fixed === '') {
            return exports.unfix(id, cb);
        }

        return exports.fix(id, data.fixed, cb);
    }

    return exports.update(id, data, cb);
};

/**
 * Update  Event
 * @param {!number} id
 * @param {!Object} data
 * @param {!function(Error, Object)} cb
 */
exports.update = function (id, data, cb) {
    'use strict';

    id = Number(id);

    return mongo.read('events', id, function (err, event) {
        if (err) {
            return cb(err, null);
        }

        if (event.fixed) {
            return cb(new errors.FixedEventError(), null);
        }

        return mongo.set('events', id, data, function (err, event) {
            if (err || event === null) {
                return cb(err, null);
            }

            delete event.terms.counter;
            delete event.participants.counter;
            delete event.comments.counter;

            return cb(null, event);
        });
    });
};

/**
 * Fix Event
 * @param {!number} id
 * @param {!number} termID
 * @param {!function(Error, Object)} cb
 */
exports.fix = function (id, termID, cb) {
    'use strict';

    id = Number(id);
    termID = Number(termID);

    return mongo.read('events', id, function (err, event) {
        if (err) {
            return cb(err, null);
        }

        if (event.fixed) {
            return cb(new errors.FixedEventError(), null);
        }

        if (!(termID in event.terms)) {
            var deleted = (1 <= termID && termID <= event.terms.counter);
            return cb(new errors.TermNotFoundError(deleted), null);
        }

        return mongo.set('events', id, {fixed: termID}, function (err, event) {
            if (err || event === null) {
                return cb(err, null);
            }

            delete event.terms.counter;
            delete event.participants.counter;
            delete event.comments.counter;

            return cb(null, event);
        });
    });
};

/**
 * Unfix Event
 * @param {!number} id
 * @param {!function(Error, Object)} cb - function(err, event)
 */
exports.unfix = function (id, cb) {
    'use strict';

    id = Number(id);

    return mongo.unset('events', id, 'fixed', function (err, event) {
        if (err || event === null) {
            return cb(err, null);
        }

        delete event.terms.counter;
        delete event.participants.counter;
        delete event.comments.counter;

        return cb(null, event);
    });
};

/**
 * Delete Event
 * @param {!number} id
 * @param {!function(Error)} cb
 */
exports.delete = function (id, cb) {
    'use strict';

    id = Number(id);

    return mongo.delete('events', id, cb);
};

// Term

/**
 * Add Term
 * @param {!number} id
 * @param {!string} term
 * @param {!function(Error, Object)} cb
 */
exports.addTerm = function (id, term, cb) {
    'use strict';

    id = Number(id);

    mongo.read('events', id, function (err, event) {
        if (err) {
            return cb(err, null);
        }

        if (event.fixed) {
            return cb(new errors.FixedEventError(), null);
        }

        // Duplication Check
        for (var existingTermID in event.terms) {
            if (existingTermID === 'counter') {
                continue;
            }

            existingTermID = Number(existingTermID);
            var existing = event.terms[existingTermID];

            if (existing === term) {
                return cb(new errors.DuplicatedTermError(), null);
            }
        }

        var termID = ++event.terms.counter;

        // Modify Terms
        event.terms[termID] = term;

        // Modify Record
        for (var participantID in event.record) {
            event.record[participantID][termID] = 'absence';
        }

        // Construct the difference
        var diff = {terms: event.terms, record: event.record};

        // Update DB
        return mongo.set('events', id, diff, function (err, event) {
            if (err || event === null) {
                return cb(err, null);
            }

            delete event.terms.counter;
            delete event.participants.counter;
            delete event.comments.counter;

            return cb(null, event);
        });
    });
};

/**
 * Update Term
 * @param {!number} id
 * @param {!number} termID
 * @param {!string} term
 * @param {!function(Error, Object)} cb
 */
exports.updateTerm = function (id, termID, term, cb) {
    'use strict';

    id = Number(id);
    termID = Number(termID);

    mongo.read('events', id, function (err, event) {
        if (err) {
            return cb(err, null);
        }

        if (event.fixed) {
            return cb(new errors.FixedEventError(), null);
        }

        if (!(termID in event.terms)) {
            var deleted = (1 <= termID && termID <= event.terms.counter);
            return cb(new errors.TermNotFoundError(deleted), null);
        }

        // Duplication Check
        for (var existingTermID in event.terms) {
            if (existingTermID === 'counter') {
                continue;
            }

            existingTermID = Number(existingTermID);
            var existing = event.terms[existingTermID];

            if (existing === term) {
                if (Number(existingTermID) === termID) {
                    delete event.terms.counter;
                    delete event.participants.counter;
                    delete event.comments.counter;
                    return cb(null, event);
                }

                return cb(new errors.DuplicatedTermError(), null);
            }
        }

        // Modify Terms
        event.terms[termID] = term;

        // Construct the difference
        var diff = {terms: event.terms};

        // Update DB
        return mongo.set('events', id, diff, function (err, event) {
            if (err || event === null) {
                return cb(err, null);
            }

            delete event.terms.counter;
            delete event.participants.counter;
            delete event.comments.counter;

            return cb(null, event);
        });
    });
};

/**
 * Delete Term
 * @param {!number} id
 * @param {!number} termID
 * @param {!function} cb - function(err, latest)
 */
exports.deleteTerm = function (id, termID, cb) {
    'use strict';

    id = Number(id);
    termID = Number(termID);

    mongo.read('events', id, function (err, event) {
        if (err) {
            return cb(err, null);
        }

        if (event.fixed) {
            return cb(new errors.FixedEventError(), null);
        }

        var outOfRange = termID < 1 || event.terms.counter < termID;
        if (outOfRange) {
            return cb(new errors.TermNotFoundError(false), null);
        }

        var alreadyDeleted = !(termID in event.terms);
        if (alreadyDeleted) {
            delete event.terms.counter;
            delete event.participants.counter;
            delete event.comments.counter;
            return cb(null, event);
        }

        // Modify Terms
        delete event.terms[termID];

        // Modify Record
        for (var participantID in event.record) {
            delete event.record[participantID][termID];
        }

        // Construct the difference
        var diff = {terms: event.terms, record: event.record};

        // Update DB
        return mongo.set('events', id, diff, function (err, event) {
            if (err || event === null) {
                return cb(err, null);
            }

            delete event.terms.counter;
            delete event.participants.counter;
            delete event.comments.counter;

            return cb(null, event);
        });
    });
};

// Participants

/**
 * Add Participant
 * @param {!number} id
 * @param {!string} name
 * @param {Object.<number, string>} data
 * @param {!function(Error, Object)}cb
 */
exports.addParticipant = function (id, name, data, cb) {
    'use strict';

    id = Number(id);

    mongo.read('events', id, function (err, event) {
        if (err) {
            return cb(err, null);
        }

        if (event.fixed) {
            return cb(new errors.FixedEventError(), null);
        }

        // Duplication Check
        for (var existingParticipantID in event.participants) {
            if (existingParticipantID === 'counter') {
                continue;
            }

            existingParticipantID = Number(existingParticipantID);
            var existing = event.participants[existingParticipantID];

            if (existing === name) {
                return cb(new errors.DuplicatedParticipantError(), null);
            }
        }

        var participantID = ++event.participants.counter;

        // Modify Participants
        event.participants[participantID] = name;

        // Modify Record
        for (var termID in event.terms) {
            if (termID === 'counter') {
                continue;
            }

            if (!event.record[participantID]) {
                event.record[participantID] = {};
            }

            if (termID in data) {
                event.record[participantID][termID] = data[termID];
            } else {
                event.record[participantID][termID] = 'absence';
            }
        }

        // Construct the difference
        var diff = {participants: event.participants, record: event.record};

        // Update DB
        return mongo.set('events', id, diff, function (err, event) {
            if (err || event === null) {
                return cb(err, null);
            }

            delete event.terms.counter;
            delete event.participants.counter;
            delete event.comments.counter;

            return cb(null, event);
        });
    });
};

/**
 * Update Participant
 * @param {!number} id
 * @param {!number} participantID
 * @param {Object.<number, string>} data
 * @param {!function(Error, Object)} cb
 */
exports.updateParticipant = function (id, participantID, data, cb) {
    'use strict';

    id = Number(id);
    participantID = Number(participantID);

    mongo.read('events', id, function (err, event) {
        if (err) {
            return cb(err, null);
        }

        var needToModify = (1 <= Object.keys(data).length);
        if (!needToModify) {
            delete event.terms.counter;
            delete event.participants.counter;
            delete event.comments.counter;
            return cb(null, event);
        }

        if (event.fixed) {
            return cb(new errors.FixedEventError(), null);
        }

        if (!(participantID in event.participants)) {
            var deleted = 1 <= participantID && participantID <= event.participants.counter;
            return cb(new errors.ParticipantNotFoundError(deleted), null);
        }

        // Duplication Check
        for (var existingParticipantID in event.participants) {
            if (existingParticipantID === 'counter') {
                continue;
            }

            existingParticipantID = Number(existingParticipantID);

            if (existingParticipantID === participantID) {
                continue;
            }
            
            var existing = event.participants[existingParticipantID];

            if (existing === data.name) {
                return cb(new errors.DuplicatedParticipantError(), null);
            }
        }

        // Modify Participants
        event.participants[participantID] = data.name;

        // Modify Record
        for (var termID in data) {
            if (termID in event.terms) {
                event.record[participantID][termID] = data[termID];
            }
        }

        // Construct the difference
        var diff = {participants: event.participants, record: event.record};

        // Update DB
        return mongo.set('events', id, diff, function (err, event) {
            if (err || event === null) {
                return cb(err, null);
            }

            delete event.terms.counter;
            delete event.participants.counter;
            delete event.comments.counter;

            return cb(null, event);
        });
    });
};

/**
 * Delete Participant
 * @param {!number} id
 * @param {!number} participantID
 * @param {!function(Error, Object)} cb
 */
exports.deleteParticipant = function (id, participantID, cb) {
    'use strict';

    id = Number(id);
    participantID = Number(participantID);

    mongo.read('events', id, function (err, event) {
        if (err) {
            return cb(err, null);
        }

        if (event.fixed) {
            return cb(new errors.FixedEventError(), null);
        }

        var outOfRange = participantID < 1 || event.participants.counter < participantID;
        if (outOfRange) {
            return cb(new errors.ParticipantNotFoundError(false), null);
        }

        var alreadyDeleted = !(participantID in event.participants);
        if (alreadyDeleted) {
            delete event.terms.counter;
            delete event.participants.counter;
            delete event.comments.counter;
            return cb(null, event);
        }

        // Modify Participants
        delete event.participants[participantID];

        // Modify Record
        delete event.record[participantID];

        // Construct the difference
        var diff = {participants: event.participants, record: event.record};

        // Update DB
        return mongo.set('events', id, diff, function (err, event) {
            if (err || event === null) {
                return cb(err, null);
            }

            delete event.terms.counter;
            delete event.participants.counter;
            delete event.comments.counter;

            return cb(null, event);
        });
    });
};

// Comment

/**
 * Add Comment
 * @param {!number} id
 * @param {!string} name
 * @param {!string} body
 * @param {!function(Error, Object)} cb
 */
exports.addComment = function (id, name, body, cb) {
    'use strict';

    id = Number(id);

    mongo.read('events', id, function (err, event) {
        if (err) {
            return cb(err, null);
        }

        var commentID = ++event.comments.counter;

        // Modify Comments
        event.comments[commentID] = {
            name: name,
            body: body
        };

        // Construct the difference
        var diff = {comments: event.comments};

        // Update DB
        return mongo.set('events', id, diff, function (err, event) {
            if (err || event === null) {
                return cb(err, null);
            }

            delete event.terms.counter;
            delete event.participants.counter;
            delete event.comments.counter;

            return cb(null, event);
        });
    });
};

/**
 * Update Comment
 * @param {!number} id
 * @param {!number} commentID
 * @param {!{name: !string, body: !string}} data
 * @param {!function(Error, Object)} cb
 */
exports.updateComment = function (id, commentID, data, cb) {
    'use strict';

    id = Number(id);
    commentID = Number(commentID);

    mongo.read('events', id, function (err, event) {
        if (err) {
            return cb(err, null);
        }

        var needToModify = ('name' in data) || ('body' in data);
        if (!needToModify) {
            delete event.terms.counter;
            delete event.participants.counter;
            delete event.comments.counter;
            return cb(null, event);
        }

        if (!(commentID in event.comments)) {
            var deleted = 1 <= commentID && commentID <= event.comments.counter;
            return cb(new errors.CommentNotFoundError(deleted), null);
        }

        // Modify Comments
        if ('name' in data) {
            event.comments[commentID].name = data.name;
        }
        if ('body' in data) {
            event.comments[commentID].body = data.body;
        }

        // Construct the difference
        var diff = {comments: event.comments};

        // Update DB
        return mongo.set('events', id, diff, function (err, event) {
            if (err || event === null) {
                return cb(err, null);
            }

            delete event.terms.counter;
            delete event.participants.counter;
            delete event.comments.counter;

            return cb(null, event);
        });
    });
};

/**
 * Delete Comment
 * @param {!number} id
 * @param {!number} commentID
 * @param {!function(Error, Object)} cb
 */
exports.deleteComment = function (id, commentID, cb) {
    'use strict';

    id = Number(id);
    commentID = Number(commentID);

    mongo.read('events', id, function (err, event) {
        if (err) {
            return cb(err, null);
        }

        var outOfRange = commentID < 1 || event.comments.counter < commentID;
        if (outOfRange) {
            return cb(new errors.CommentNotFoundError(false), null);
        }

        var alreadyDeleted = !(commentID in event.comments);
        if (alreadyDeleted) {
            delete event.terms.counter;
            delete event.participants.counter;
            delete event.comments.counter;
            return cb(null, event);
        }

        // Modify Comments
        delete event.comments[commentID];

        // Construct the difference
        var diff = {comments: event.comments};

        // Update DB
        return mongo.set('events', id, diff, function (err, event) {
            if (err || event === null) {
                return cb(err, null);
            }

            delete event.terms.counter;
            delete event.participants.counter;
            delete event.comments.counter;

            return cb(null, event);
        });
    });
};
