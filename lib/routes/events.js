'use strict';

var express = require('express');
var router = express.Router();

var errors = require('../errors');
var events = require('../models/events');

var form = require('../util/form');
var sanitizers = form.sanitizers;
var validators = form.validators;

var iso8601 = require('../util/iso8601.js');

var sort = (terms) => {
  let array = [];

  for (let termID in terms) {
    array.push({
      id: termID,
      term: terms[termID]
    });
  }

  return array.sort((a, b) => {
    return iso8601.compare(a.term, b.term);
  });
};

router.post('/', (req, res) => {
  let sanitized;
  try {
    sanitized = form.check(req.body, [
      form.def('title', true, sanitizers.strip, [validators.length(1, 255), validators.isOneLine]),
      form.def('description', false, sanitizers.strip, validators.length(0, 2048))
    ]);
  } catch (e) {
    return res.status(400).json(new errors.InvalidParameterError().json);
  }

  sanitized.description = sanitized.description || '';

  events.create(sanitized.title, sanitized.description, (err, event) => {
    if (err || event === null) {
      return res.status(500).json(new errors.ServerSideError().json);
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
  let id = Number(req.params.id);

  events.get(id, (err, event) => {
    if (err instanceof errors.NotFoundError) {
      return res.status(err.deleted ? 410 : 404).json(err.json);
    }

    if (err) {
      return res.status(500).json(new errors.ServerSideError().json);
    }

    if (req.accepts('html')) {
      event.terms = sort(event.terms);

      return res.status(200).render('event', {event: event});
    }

    return res.status(200).json(event);
  });
});

router.put('/:id(\\d+)', (req, res) => {
  let id = Number(req.params.id);

  let emptyOrNumber = (value) => {
    return validators.isEmpty(value) || validators.ge(1)(value);
  };

  let sanitized;
  try {
    sanitized = form.check(req.body, [
      form.def('title', false, sanitizers.strip, [validators.length(1, 255), validators.isOneLine]),
      form.def('description', false, sanitizers.strip, validators.length(0, 2048)),
      form.def('fixed', false, sanitizers.strip, emptyOrNumber)
    ]);
  } catch (e) {
    return res.status(400).json(new errors.InvalidParameterError().json);
  }

  events.put(id, sanitized, (err, event) => {
    if (err instanceof errors.NotFoundError) {
      return res.status(err.deleted ? 410 : 404).json(err.json);
    }

    if (err instanceof errors.FixedEventError) {
      return res.status(409).json(err.json);
    }

    if (err instanceof errors.TermNotFoundError) {
      return res.status(409).json(err.json);
    }

    if (err || event === null) {
      return res.status(500).json(new errors.ServerSideError().json);
    }

    if (req.accepts('html')) {
      return res.status(200).render('event', {event: event});
    }

    return res.status(200).json(event);
  });
});

router.delete('/:id(\\d+)', (req, res) => {
  let id = Number(req.params.id);

  events.delete(id, (err) => {
    if ((err instanceof errors.NotFoundError) && !err.deleted) {
      return res.status(404).json(err.json);
    }

    if (err) {
      return res.status(500).json(new errors.ServerSideError().json);
    }

    if (req.accepts('html')) {
      return res.redirect('/');
    }

    return res.status(204).json(null);
  });
});

module.exports = router;
