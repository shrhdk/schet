'use strict';

var util = require('util');

var ERRORS = require('../errors');
var mongo = require('./mongo');

var clean = (event) => {
  delete event.terms.counter;
  delete event.participants.counter;
  delete event.comments.counter;

  return event;
};

// Event

/**
 * Create Event
 * @param {!string} title
 * @param {!string} description
 * @param {!function(Error, Object)} cb
 */
exports.create = function (title, description, cb) {
  let data = {
    title: title,
    description: description,
    terms: {counter: 0},
    participants: {counter: 0},
    record: {},
    comments: {counter: 0}
  };

  return mongo.create('events', data, function (err, event) {
    if (err || event === null) {
      return cb(err);
    }

    return cb(null, clean(event));
  });
};

/**
 * Get Event
 * @param {!number} id
 * @param {!function(Error, Object)} cb
 */
exports.get = (id, cb) => {
  id = Number(id);

  return mongo.read('events', id, (err, event) => {
    if (err || event === null) {
      return cb(err);
    }

    return cb(null, clean(event));
  });
};

/**
 * Update, Fix or Unfix Event
 * @param {!number} id
 * @param {!Object} data
 * @param {!function(Error, Object)} cb
 */
exports.put = (id, data, cb) => {
  id = Number(id);

  if ('fixed' in data) {
    if ('title' in data || 'description' in data) {
      return cb(ERRORS.INVALID_PARAMETER_ERROR, null);
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
exports.update = (id, data, cb) => {
  id = Number(id);

  return mongo.read('events', id, (err, event) => {
    if (err) {
      return cb(err);
    }

    if (event.fixed) {
      return cb(ERRORS.FIXED_EVENT_ERROR, null);
    }

    return mongo.set('events', id, data, (err, event) => {
      if (err || event === null) {
        return cb(err);
      }

      return cb(null, clean(event));
    });
  });
};

/**
 * Fix Event
 * @param {!number} id
 * @param {!number} termID
 * @param {!function(Error, Object)} cb
 */
exports.fix = (id, termID, cb) => {
  id = Number(id);
  termID = Number(termID);

  return mongo.read('events', id, (err, event) => {
    if (err) {
      return cb(err);
    }

    if (event.fixed) {
      return cb(ERRORS.FIXED_EVENT_ERROR, null);
    }

    if (!(termID in event.terms)) {
      return cb(ERRORS.TERM_NOT_FOUND_ERROR, null);
    }

    return mongo.set('events', id, {fixed: termID}, (err, event) => {
      if (err || event === null) {
        return cb(err);
      }

      return cb(null, clean(event));
    });
  });
};

/**
 * Unfix Event
 * @param {!number} id
 * @param {!function(Error, Object)} cb - function(err, event)
 */
exports.unfix = (id, cb) => {
  id = Number(id);

  return mongo.unset('events', id, 'fixed', (err, event) => {
    if (err || event === null) {
      return cb(err);
    }

    return cb(null, clean(event));
  });
};

/**
 * Delete Event
 * @param {!number} id
 * @param {!function(Error)} cb
 */
exports.delete = (id, cb) => {
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
exports.addTerm = (id, term, cb) => {
  id = Number(id);

  mongo.read('events', id, (err, event) => {
    if (err) {
      return cb(err);
    }

    if (event.fixed) {
      return cb(ERRORS.FIXED_EVENT_ERROR, null);
    }

    // Duplication Check
    for (let existingTermID in event.terms) {
      if (existingTermID === 'counter') {
        continue;
      }

      let existing = event.terms[Number(existingTermID)];

      if (existing === term) {
        return cb(ERRORS.DUPLICATED_TERM_ERROR, null);
      }
    }

    let termID = ++event.terms.counter;

    // Modify Terms
    event.terms[termID] = term;

    // Modify Record
    for (let participantID in event.record) {
      event.record[participantID][termID] = 'absence';
    }

    // Construct the difference
    let diff = {terms: event.terms, record: event.record};

    // Update DB
    return mongo.set('events', id, diff, (err, event) => {
      if (err || event === null) {
        return cb(err);
      }

      return cb(null, clean(event));
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
exports.updateTerm = (id, termID, term, cb) => {
  id = Number(id);
  termID = Number(termID);

  mongo.read('events', id, (err, event) => {
    if (err) {
      return cb(err);
    }

    if (event.fixed) {
      return cb(ERRORS.FIXED_EVENT_ERROR, null);
    }

    if (!(termID in event.terms)) {
      return cb(ERRORS.TERM_NOT_FOUND_ERROR, null);
    }

    // Duplication Check
    for (let existingTermID in event.terms) {
      if (existingTermID === 'counter') {
        continue;
      }

      existingTermID = Number(existingTermID);
      let existing = event.terms[existingTermID];

      if (existing === term) {
        if (Number(existingTermID) === termID) {
          return cb(null, clean(event));
        }

        return cb(ERRORS.DUPLICATED_TERM_ERROR, null);
      }
    }

    // Modify Terms
    event.terms[termID] = term;

    // Construct the difference
    let diff = {terms: event.terms};

    // Update DB
    return mongo.set('events', id, diff, (err, event) => {
      if (err || event === null) {
        return cb(err);
      }

      return cb(null, clean(event));
    });
  });
};

/**
 * Delete Term
 * @param {!number} id
 * @param {!number} termID
 * @param {!function} cb - function(err, latest)
 */
exports.deleteTerm = (id, termID, cb) => {
  id = Number(id);
  termID = Number(termID);

  mongo.read('events', id, (err, event) => {
    if (err) {
      return cb(err);
    }

    if (event.fixed) {
      return cb(ERRORS.FIXED_EVENT_ERROR, null);
    }

    if (!(termID in event.terms)) {
      return cb(null, clean(event));
    }

    // Modify Terms
    delete event.terms[termID];

    // Modify Record
    for (let participantID in event.record) {
      delete event.record[participantID][termID];
    }

    // Construct the difference
    let diff = {terms: event.terms, record: event.record};

    // Update DB
    return mongo.set('events', id, diff, (err, event) => {
      if (err || event === null) {
        return cb(err);
      }

      return cb(null, clean(event));
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
exports.addParticipant = (id, name, data, cb) => {
  id = Number(id);

  mongo.read('events', id, (err, event) => {
    if (err) {
      return cb(err);
    }

    if (event.fixed) {
      return cb(ERRORS.FIXED_EVENT_ERROR, null);
    }

    // Duplication Check
    for (let existingParticipantID in event.participants) {
      if (existingParticipantID === 'counter') {
        continue;
      }

      existingParticipantID = Number(existingParticipantID);
      let existing = event.participants[existingParticipantID];

      if (existing === name) {
        return cb(ERRORS.DUPLICATED_PARTICIPANT_ERROR, null);
      }
    }

    let participantID = ++event.participants.counter;

    // Modify Participants
    event.participants[participantID] = name;

    // Modify Record
    event.record[participantID] = {};
    for (let termID in event.terms) {
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
    let diff = {participants: event.participants, record: event.record};

    // Update DB
    return mongo.set('events', id, diff, (err, event) => {
      if (err || event === null) {
        return cb(err);
      }

      return cb(null, clean(event));
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
exports.updateParticipant = (id, participantID, data, cb) => {
  id = Number(id);
  participantID = Number(participantID);

  mongo.read('events', id, (err, event) => {
    if (err) {
      return cb(err);
    }

    let needToModify = (1 <= Object.keys(data).length);
    if (!needToModify) {
      return cb(null, clean(event));
    }

    if (event.fixed) {
      return cb(ERRORS.FIXED_EVENT_ERROR, null);
    }

    if (!(participantID in event.participants)) {
      return cb(ERRORS.PARTICIPANT_NOT_FOUND_ERROR, null);
    }

    // Duplication Check
    for (let existingParticipantID in event.participants) {
      if (existingParticipantID === 'counter') {
        continue;
      }

      existingParticipantID = Number(existingParticipantID);

      if (existingParticipantID === participantID) {
        continue;
      }

      let existing = event.participants[existingParticipantID];

      if (existing === data.name) {
        return cb(ERRORS.DUPLICATED_PARTICIPANT_ERROR, null);
      }
    }

    // Modify Participants
    if ('name' in data) {
      event.participants[participantID] = data.name;
    }

    // Modify Record
    for (let termID in data) {
      if (termID in event.terms) {
        event.record[participantID][termID] = data[termID];
      }
    }

    // Construct the difference
    let diff = {participants: event.participants, record: event.record};

    // Update DB
    return mongo.set('events', id, diff, (err, event) => {
      if (err || event === null) {
        return cb(err);
      }

      return cb(null, clean(event));
    });
  });
};

/**
 * Delete Participant
 * @param {!number} id
 * @param {!number} participantID
 * @param {!function(Error, Object)} cb
 */
exports.deleteParticipant = (id, participantID, cb) => {
  id = Number(id);
  participantID = Number(participantID);

  mongo.read('events', id, (err, event) => {
    if (err) {
      return cb(err);
    }

    if (event.fixed) {
      return cb(ERRORS.FIXED_EVENT_ERROR, null);
    }

    if (!(participantID in event.participants)) {
      return cb(null, clean(event));
    }

    // Modify Participants
    delete event.participants[participantID];

    // Modify Record
    delete event.record[participantID];

    // Construct the difference
    let diff = {participants: event.participants, record: event.record};

    // Update DB
    return mongo.set('events', id, diff, (err, event) => {
      if (err || event === null) {
        return cb(err);
      }

      return cb(null, clean(event));
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
exports.addComment = (id, name, body, cb) => {
  id = Number(id);

  mongo.read('events', id, (err, event) => {
    if (err) {
      return cb(err);
    }

    let commentID = ++event.comments.counter;

    // Modify Comments
    event.comments[commentID] = {
      name: name,
      body: body
    };

    // Construct the difference
    let diff = {comments: event.comments};

    // Update DB
    return mongo.set('events', id, diff, (err, event) => {
      if (err || event === null) {
        return cb(err);
      }

      return cb(null, clean(event));
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
exports.updateComment = (id, commentID, data, cb) => {
  id = Number(id);
  commentID = Number(commentID);

  mongo.read('events', id, (err, event) => {
    if (err) {
      return cb(err);
    }

    let needToModify = ('name' in data) || ('body' in data);
    if (!needToModify) {
      return cb(null, clean(event));
    }

    if (!(commentID in event.comments)) {
      return cb(ERRORS.COMMENT_NOT_FOUND_ERROR, null);
    }

    // Modify Comments
    if ('name' in data) {
      event.comments[commentID].name = data.name;
    }
    if ('body' in data) {
      event.comments[commentID].body = data.body;
    }

    // Construct the difference
    let diff = {comments: event.comments};

    // Update DB
    return mongo.set('events', id, diff, (err, event) => {
      if (err || event === null) {
        return cb(err);
      }

      return cb(null, clean(event));
    });
  });
};

/**
 * Delete Comment
 * @param {!number} id
 * @param {!number} commentID
 * @param {!function(Error, Object)} cb
 */
exports.deleteComment = (id, commentID, cb) => {
  id = Number(id);
  commentID = Number(commentID);

  mongo.read('events', id, (err, event) => {
    if (err) {
      return cb(err);
    }

    if (!(commentID in event.comments)) {
      return cb(null, clean(event));
    }

    // Modify Comments
    delete event.comments[commentID];

    // Construct the difference
    let diff = {comments: event.comments};

    // Update DB
    return mongo.set('events', id, diff, (err, event) => {
      if (err || event === null) {
        return cb(err);
      }

      return cb(null, clean(event));
    });
  });
};
