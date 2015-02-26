'use strict';

var express = require('express');
var router = express.Router();

var errors = require('../errors');
var events = require('../models/events');

var form = require('../util/form');
var sanitizers = form.sanitizers;
var validators = form.validators;

router.post('/:id(\\d+)/terms', (req, res) => {
  let id = Number(req.params.id);

  let sanitized;
  try {
    sanitized = form.check(req.body, [
      form.def('term', true, sanitizers.strip, validators.isDateString)
    ]);
  } catch (e) {
    return res.status(400).json(new errors.InvalidParameterError().json);
  }

  events.addTerm(id, sanitized.term, (err, event) => {
    if (err instanceof errors.InvalidParameterError) {
      return res.status(400).json(err.json);
    }

    if (err instanceof errors.NotFoundError) {
      return res.status(err.deleted ? 410 : 404).json(err.json);
    }

    if (err instanceof errors.FixedEventError) {
      return res.status(409).json(err.json);
    }

    if (err instanceof errors.DuplicatedTermError) {
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

router.put('/:id(\\d+)/terms/:termID(\\d+)', (req, res) => {
  let id = Number(req.params.id);
  let termID = Number(req.params.termID);

  let sanitized;
  try {
    sanitized = form.check(req.body, [
      form.def('term', true, sanitizers.strip, validators.isDateString)
    ]);
  } catch (e) {
    return res.status(400).json(new errors.InvalidParameterError().json);
  }

  events.updateTerm(id, termID, sanitized.term, (err, event) => {
    if (err instanceof errors.InvalidParameterError) {
      return res.status(400).json(err.json);
    }

    if (err instanceof errors.NotFoundError) {
      return res.status(err.deleted ? 410 : 404).json(err.json);
    }

    if (err instanceof errors.FixedEventError) {
      return res.status(409).json(err.json);
    }

    if (err instanceof errors.TermNotFoundError) {
      return res.status(err.deleted ? 410 : 404).json(err.json);
    }

    if (err instanceof errors.DuplicatedTermError) {
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

router.delete('/:id(\\d+)/terms/:termID(\\d+)', (req, res) => {
  let id = Number(req.params.id);
  let termID = Number(req.params.termID);

  events.deleteTerm(id, termID, (err, event) => {
    if (err instanceof errors.NotFoundError) {
      return res.status(err.deleted ? 410 : 404).json(err.json);
    }

    if (err instanceof errors.FixedEventError) {
      return res.status(409).json(err.json);
    }

    if ((err instanceof errors.TermNotFoundError) && !err.deleted) {
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
