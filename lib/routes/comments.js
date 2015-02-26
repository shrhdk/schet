'use strict';

var express = require('express');
var router = express.Router();

var errors = require('../errors');
var events = require('../models/events');

var form = require('../util/form');
var sanitizers = form.sanitizers;
var validators = form.validators;

router.post('/:id(\\d+)/comments', (req, res) => {
  let id = Number(req.params.id);

  let sanitized;
  try {
    sanitized = form.check(req.body, [
      form.def('name', true, sanitizers.strip, [validators.length(1, 255), validators.isOneLine]),
      form.def('body', true, sanitizers.strip, validators.length(1, 2048))
    ]);
  } catch (e) {
    return res.status(400).json(new errors.InvalidParameterError().json);
  }

  events.addComment(id, sanitized.name, sanitized.body, (err, event) => {
    if (err instanceof errors.NotFoundError) {
      return res.status(err.deleted ? 410 : 404).json(err.json);
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

router.put('/:id(\\d+)/comments/:commentID(\\d+)', (req, res) => {
  let id = Number(req.params.id);
  let commentID = Number(req.params.commentID);

  let sanitized;
  try {
    sanitized = form.check(req.body, [
      form.def('name', false, sanitizers.strip, [validators.length(1, 255), validators.isOneLine]),
      form.def('body', false, sanitizers.strip, validators.length(1, 2048))
    ]);
  } catch (e) {
    return res.status(400).json(new errors.InvalidParameterError().json);
  }

  events.updateComment(id, commentID, sanitized, (err, event) => {
    if (err instanceof errors.NotFoundError) {
      return res.status(err.deleted ? 410 : 404).json(err.json);
    }

    if (err instanceof errors.CommentNotFoundError) {
      return res.status(err.deleted ? 410 : 404).json(err.json);
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

router.delete('/:id(\\d+)/comments/:commentID(\\d+)', (req, res) => {
  let id = Number(req.params.id);
  let commentID = Number(req.params.commentID);

  events.deleteComment(id, commentID, (err, event) => {
    if (err instanceof errors.NotFoundError) {
      return res.status(err.deleted ? 410 : 404).json(err.json);
    }

    if ((err instanceof errors.CommentNotFoundError) && !err.deleted) {
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
