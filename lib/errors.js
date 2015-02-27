'use strict';

var util = require('util');

/**
 * @constructor
 */
var SchetError = function (name) {
  Error.call(this);
  this.name = name;
  this.json = {error: this.name};
};
util.inherits(SchetError, Error);

var ERRORS = {
  SERVER_SIDE_ERROR: new SchetError('ServerSideError'),
  INVALID_PARAMETER_ERROR: new SchetError('InvalidParameterError'),
  NOT_FOUND_ERROR: new SchetError('NotFoundError'),
  FIXED_EVENT_ERROR: new SchetError('FixedEventError'),
  TERM_NOT_FOUND_ERROR: new SchetError('TermNotFoundError'),
  PARTICIPANT_NOT_FOUND_ERROR: new SchetError('ParticipantNotFoundError'),
  COMMENT_NOT_FOUND_ERROR: new SchetError('CommentNotFoundError'),
  DUPLICATED_TERM_ERROR: new SchetError('DuplicatedTermError'),
  DUPLICATED_PARTICIPANT_ERROR: new SchetError('DuplicatedParticipantError'),
  UNSUPPORTED_OPERATION_ERROR: new SchetError('UnsupportedOperationError')
};

module.exports = ERRORS;
