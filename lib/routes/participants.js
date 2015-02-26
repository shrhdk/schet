'use strict';

var express = require('express');
var router = express.Router();

var errors = require('../errors');
var events = require('../models/events');

var form = require('../util/form');
var matchers = form.matchers;
var sanitizers = form.sanitizers;
var validators = form.validators;

router.post('/:id(\\d+)/participants', (req, res) => {
  let id = Number(req.params.id);

  let sanitized;
  try {
    sanitized = form.check(req.body, [
      form.def('name', true, sanitizers.strip, [validators.length(1, 255), validators.isOneLine]),
      form.def(matchers.ge(1), 0, sanitizers.strip, validators.list('presence', 'absence', 'uncertain'))
    ]);
  } catch (e) {
    return res.status(400).json(new errors.InvalidParameterError().json);
  }

  let name = sanitized.name;
  let data = sanitized;
  delete data.name;

  events.addParticipant(id, name, data, (err, event) => {
    if (err instanceof errors.NotFoundError) {
      return res.status(err.deleted ? 410 : 404).json(err.json);
    }

    if (err instanceof errors.FixedEventError) {
      return res.status(409).json(err.json);
    }

    if (err instanceof errors.DuplicatedParticipantError) {
      return res.status(409).json(err.json);
    }

    if (err || event === null) {
      return res.status(500).json(new errors.ServerSideError().json);
    }

    if (req.accepts('html')) {
      return res.redirect('/' + event.id);
    }

    return res.status(201).json(event);
  });
});

router.put('/:id(\\d+)/participants/:participantID(\\d+)', (req, res) => {
  let id = Number(req.params.id);
  let participantID = Number(req.params.participantID);

  let sanitized;
  try {
    sanitized = form.check(req.body, [
      form.def('name', false, sanitizers.strip, [validators.length(1, 255), validators.isOneLine]),
      form.def(matchers.ge(1), 0, sanitizers.strip, validators.list('presence', 'absence', 'uncertain'))
    ]);
  } catch (e) {
    return res.status(400).json(new errors.InvalidParameterError().json);
  }

  events.updateParticipant(id, participantID, sanitized, (err, event) => {
    if (err instanceof errors.NotFoundError) {
      return res.status(err.deleted ? 410 : 404).json(err.json);
    }

    if (err instanceof errors.FixedEventError) {
      return res.status(409).json(err.json);
    }

    if (err instanceof errors.ParticipantNotFoundError) {
      return res.status(err.deleted ? 410 : 404).json(err.json);
    }

    if (err instanceof errors.DuplicatedParticipantError) {
      return res.status(409).json(err.json);
    }

    if (err || event === null) {
      return res.status(500).json(new errors.ServerSideError().json);
    }

    if (req.accepts('html')) {
      return res.redirect('/' + event.id);
    }

    return res.status(200).json(event);
  });
});

router.delete('/:id(\\d+)/participants/:participantID(\\d+)', (req, res) => {
  let id = Number(req.params.id);
  let participantID = Number(req.params.participantID);

  events.deleteParticipant(id, participantID, (err, event) => {
    if (err instanceof errors.NotFoundError) {
      return res.status(err.deleted ? 410 : 404).json(err.json);
    }

    if (err instanceof errors.FixedEventError) {
      return res.status(409).json(err.json);
    }

    if ((err instanceof errors.ParticipantNotFoundError) && !err.deleted) {
      return res.status(404).json(err.json);
    }

    if (err || event === null) {
      return res.status(500).json(new errors.ServerSideError().json);
    }

    if (req.accepts('html')) {
      return res.redirect('/' + event.id);
    }

    return res.status(200).json(event);
  });
});

module.exports = router;
