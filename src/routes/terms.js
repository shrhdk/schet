'use strict';

var express = require('express');
var router = express.Router();

var ERRORS = require('../errors');
var events = require('../models/events');

var form = require('../util/form');
var sanitizers = form.sanitizers;
var validators = form.validators;

router.post('/:id(\\d+)/terms', (req, res) => {
  const id = req.params.id;

  let sanitized;
  try {
    sanitized = form.check(req.body, [
      form.def('term', true, sanitizers.strip, validators.isDateString)
    ]);
  } catch (e) {
    return res.status(400).json(ERRORS.INVALID_PARAMETER_ERROR.json);
  }

  events.addTerm(id, sanitized.term, (err, event) => {
    if (err === ERRORS.INVALID_PARAMETER_ERROR)
      return res.status(400).json(err.json);

    if (err === ERRORS.NOT_FOUND_ERROR) {
      return res.status(404).json(err.json);
    }

    if (err === ERRORS.FIXED_EVENT_ERROR) {
      return res.status(409).json(err.json);
    }

    if (err === ERRORS.DUPLICATED_TERM_ERROR) {
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

router.put('/:id(\\d+)/terms/:termID(\\d+)', (req, res) => {
  const id = req.params.id;
  const termID = req.params.termID;

  let sanitized;
  try {
    sanitized = form.check(req.body, [
      form.def('term', true, sanitizers.strip, validators.isDateString)
    ]);
  } catch (e) {
    return res.status(400).json(ERRORS.INVALID_PARAMETER_ERROR.json);
  }

  events.updateTerm(id, termID, sanitized.term, (err, event) => {
    if (err === ERRORS.INVALID_PARAMETER_ERROR) {
      return res.status(400).json(err.json);
    }

    if (err === ERRORS.NOT_FOUND_ERROR) {
      return res.status(404).json(err.json);
    }

    if (err === ERRORS.FIXED_EVENT_ERROR) {
      return res.status(409).json(err.json);
    }

    if (err === ERRORS.TERM_NOT_FOUND_ERROR) {
      return res.status(404).json(err.json);
    }

    if (err === ERRORS.DUPLICATED_TERM_ERROR) {
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

router.delete('/:id(\\d+)/terms/:termID(\\d+)', (req, res) => {
  const id = req.params.id;
  const termID = req.params.termID;

  events.deleteTerm(id, termID, (err, event) => {
    if (err === ERRORS.NOT_FOUND_ERROR) {
      return res.status(404).json(err.json);
    }

    if (err === ERRORS.FIXED_EVENT_ERROR) {
      return res.status(409).json(err.json);
    }

    if (err === ERRORS.TERM_NOT_FOUND_ERROR) {
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
