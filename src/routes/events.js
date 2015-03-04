'use strict';

var util = require('util');

var express = require('express');
var router = express.Router();

var ERRORS = require('../errors');
var events = require('../models/events');
var form = require('../util/form');
var iso8601 = require('../util/iso8601.js');

var sort = terms => {
  const array = [];

  for (let termID in terms) {
    array.push({
      id: termID,
      term: terms[termID]
    });
  }

  return array.sort((a, b) => iso8601.compare(a.term, b.term));
};

router.post('/', (req, res) => {
  // title
  let title = req.body['title'];
  title = title && title.trim();
  if (!title || title.length < 1 || 255 < title.length || !form.isSingleLine(title)) {
    return res.status(400).json(ERRORS.INVALID_PARAMETER_ERROR.json);
  }

  // description
  let description = req.body['description'];
  description = description && description.trim();
  description = description || '';
  if (2048 < description.length) {
    return res.status(400).json(ERRORS.INVALID_PARAMETER_ERROR.json);
  }

  events.create(title, description, (err, event) => {
    if (err || event === null) {
      return res.status(500).json(ERRORS.SERVER_SIDE_ERROR.json);
    }

    if (req.accepts('html')) {
      return res.redirect('/' + event.id);
    }

    return res.status(201).json(event);
  });
});

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/:id(\\d+)', (req, res) => {
  const id = req.params.id;

  events.get(id, (err, event) => {
    if (err === ERRORS.NOT_FOUND_ERROR) {
      return res.status(404).json(err.json);
    }

    if (err) {
      return res.status(500).json(ERRORS.SERVER_SIDE_ERROR.json);
    }

    if (req.accepts('html')) {
      event.terms = sort(event.terms);

      return res.status(200).render('event', {event: event});
    }

    return res.status(200).json(event);
  });
});

router.put('/:id(\\d+)', (req, res) => {
  const id = req.params.id;

  // title
  let title = req.body['title'];
  if (!util.isUndefined(title)) {
    title = title.trim();
    if (title.length < 1 || 255 < title.length || !form.isSingleLine(title)) {
      return res.status(400).json(ERRORS.INVALID_PARAMETER_ERROR.json);
    }
  }

  // description
  let description = req.body['description'];
  if (!util.isUndefined(description)) {
    description = description.trim();
    if (2048 < description.length) {
      return res.status(400).json(ERRORS.INVALID_PARAMETER_ERROR.json);
    }
  }

  // fixed
  let fixed = req.body['fixed'];
  if (!util.isUndefined(fixed)) {
    fixed = fixed.trim();
    if (fixed.length === 0 || fixed < 1) {
      return res.status(400).json(ERRORS.INVALID_PARAMETER_ERROR.json);
    }
  }

  let params = form.cleanup({title, description, fixed});

  events.put(id, params, (err, event) => {
    if (err === ERRORS.NOT_FOUND_ERROR) {
      return res.status(404).json(err.json);
    }

    if (err === ERRORS.FIXED_EVENT_ERROR) {
      return res.status(409).json(err.json);
    }

    if (err === ERRORS.TERM_NOT_FOUND_ERROR) {
      return res.status(409).json(err.json);
    }

    if (err || event === null) {
      return res.status(500).json(ERRORS.SERVER_SIDE_ERROR.json);
    }

    if (req.accepts('html')) {
      return res.status(200).render('event', {event: event});
    }

    return res.status(200).json(event);
  });
});

router.delete('/:id(\\d+)', (req, res) => {
  const id = req.params.id;

  events.delete(id, err => {
    if (err === ERRORS.NOT_FOUND_ERROR) {
      return res.status(404).json(err.json);
    }

    if (err) {
      return res.status(500).json(ERRORS.SERVER_SIDE_ERROR.json);
    }

    if (req.accepts('html')) {
      return res.redirect('/');
    }

    return res.status(204).json(null);
  });
});

module.exports = router;
