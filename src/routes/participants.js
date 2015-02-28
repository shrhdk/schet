'use strict';

var express = require('express');
var router = express.Router();

var ERRORS = require('../errors');
var events = require('../models/events');

var form = require('../util/form');
var matchers = form.matchers;
var sanitizers = form.sanitizers;
var validators = form.validators;

router.post('/:id(\\d+)/participants', (req, res) => {
  const id = req.params.id;

  let sanitized;
  try {
    sanitized = form.check(req.body, [
      form.def('name', true, sanitizers.strip, [validators.length(1, 255), validators.isOneLine]),
      form.def(matchers.ge(1), 0, sanitizers.strip, validators.list('presence', 'absence', 'uncertain'))
    ]);
  } catch (e) {
    return res.status(400).json(ERRORS.INVALID_PARAMETER_ERROR.json);
  }

  const name = sanitized.name;
  const data = sanitized;
  delete data.name;

  events.addParticipant(id, name, data, (err, event) => {
    if (err === ERRORS.NOT_FOUND_ERROR) {
      return res.status(404).json(err.json);
    }

    if (err === ERRORS.FIXED_EVENT_ERROR) {
      return res.status(409).json(err.json);
    }

    if (err === ERRORS.DUPLICATED_PARTICIPANT_ERROR) {
      return res.status(409).json(err.json);
    }

    if (err || event === null) {
      return res.status(500).json(ERRORS.SERVER_SIDE_ERROR.json);
    }

    if (req.accepts('html')) {
      return res.redirect('/' + event.id);
    }

    return res.status(201).json(event);
  });
});

router.put('/:id(\\d+)/participants/:participantID(\\d+)', (req, res) => {
  const id = req.params.id;
  const participantID = req.params.participantID;

  let sanitized;
  try {
    sanitized = form.check(req.body, [
      form.def('name', false, sanitizers.strip, [validators.length(1, 255), validators.isOneLine]),
      form.def(matchers.ge(1), 0, sanitizers.strip, validators.list('presence', 'absence', 'uncertain'))
    ]);
  } catch (e) {
    return res.status(400).json(ERRORS.INVALID_PARAMETER_ERROR.json);
  }

  events.updateParticipant(id, participantID, sanitized, (err, event) => {
    if (err === ERRORS.NOT_FOUND_ERROR) {
      return res.status(404).json(err.json);
    }

    if (err === ERRORS.FIXED_EVENT_ERROR) {
      return res.status(409).json(err.json);
    }

    if (err === ERRORS.PARTICIPANT_NOT_FOUND_ERROR) {
      return res.status(404).json(err.json);
    }

    if (err === ERRORS.DUPLICATED_PARTICIPANT_ERROR) {
      return res.status(409).json(err.json);
    }

    if (err || event === null) {
      return res.status(500).json(ERRORS.SERVER_SIDE_ERROR.json);
    }

    if (req.accepts('html')) {
      return res.redirect('/' + event.id);
    }

    return res.status(200).json(event);
  });
});

router.delete('/:id(\\d+)/participants/:participantID(\\d+)', (req, res) => {
  const id = req.params.id;
  const participantID = req.params.participantID;

  events.deleteParticipant(id, participantID, (err, event) => {
    if (err === ERRORS.NOT_FOUND_ERROR) {
      return res.status(404).json(err.json);
    }

    if (err === ERRORS.FIXED_EVENT_ERROR) {
      return res.status(409).json(err.json);
    }

    if (err === ERRORS.PARTICIPANT_NOT_FOUND_ERROR) {
      return res.status(404).json(err.json);
    }

    if (err || event === null) {
      return res.status(500).json(ERRORS.SERVER_SIDE_ERROR.json);
    }

    if (req.accepts('html')) {
      return res.redirect('/' + event.id);
    }

    return res.status(200).json(event);
  });
});

module.exports = router;
