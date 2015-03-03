'use strict';

var express = require('express');
var router = express.Router();

var ERRORS = require('../errors');
var events = require('../models/events');

var form = require('../util/form');
var sanitizers = form.sanitizers;
var validators = form.validators;

router.post('/:id(\\d+)/comments', (req, res) => {
  const id = req.params.id;

  let sanitized;
  try {
    sanitized = form.check(req.body, [
      form.def('name', true, sanitizers.strip, [validators.length(1, 255), validators.isOneLine]),
      form.def('body', true, sanitizers.strip, validators.length(1, 2048))
    ]);
  } catch (e) {
    return res.status(400).json(ERRORS.INVALID_PARAMETER_ERROR.json);
  }

  events.addComment(id, sanitized.name, sanitized.body, (err, event) => {
    if (err === ERRORS.NOT_FOUND_ERROR) {
      return res.status(404).json(err.json);
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

router.put('/:id(\\d+)/comments/:commentID(\\d+)', (req, res) => {
  const id = req.params.id;
  const commentID = req.params.commentID;

  let sanitized;
  try {
    sanitized = form.check(req.body, [
      form.def('name', false, sanitizers.strip, [validators.length(1, 255), validators.isOneLine]),
      form.def('body', false, sanitizers.strip, validators.length(1, 2048))
    ]);
  } catch (e) {
    return res.status(400).json(ERRORS.INVALID_PARAMETER_ERROR.json);
  }

  events.updateComment(id, commentID, sanitized, (err, event) => {
    if (err === ERRORS.NOT_FOUND_ERROR) {
      return res.status(404).json(err.json);
    }

    if (err === ERRORS.COMMENT_NOT_FOUND_ERROR) {
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

router.delete('/:id(\\d+)/comments/:commentID(\\d+)', (req, res) => {
  const id = req.params.id;
  const commentID = req.params.commentID;

  events.deleteComment(id, commentID, (err, event) => {
    if (err === ERRORS.NOT_FOUND_ERROR) {
      return res.status(404).json(err.json);
    }

    if (err === ERRORS.COMMENT_NOT_FOUND_ERROR) {
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
