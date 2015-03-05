'use strict';

var util = require('util');

var express = require('express');
var router = express.Router();

var ERRORS = require('../errors');
var events = require('../models/events');

var form = require('../util/form');

router.post('/:id(\\d+)/comments', (req, res) => {
  const id = req.params.id;

  // param name
  let name = req.body['name'];
  name = name && form.strictTrim(name);
  if (!name || name.length < 1 || 255 < name.length || !form.isSingleLine(name)) {
    return res.status(400).json(ERRORS.INVALID_PARAMETER_ERROR.json);
  }

  // param body
  let body = req.body['body'];
  body = body && form.strictTrim(body);
  if (!body || body.length < 1 || 2048 < body.length) {
    return res.status(400).json(ERRORS.INVALID_PARAMETER_ERROR.json);
  }

  events.addComment(id, name, body, (err, event) => {
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

  // param name
  let name = req.body['name'];
  if (!util.isUndefined(name)) {
    name = form.strictTrim(name);
    if (!name || name.length < 1 || 255 < name.length || !form.isSingleLine(name)) {
      return res.status(400).json(ERRORS.INVALID_PARAMETER_ERROR.json);
    }
  }

  // param body
  let body = req.body['body'];
  if (!util.isUndefined(body)) {
    body = form.strictTrim(body);
    if (!body || body.length < 1 || 2048 < body.length) {
      return res.status(400).json(ERRORS.INVALID_PARAMETER_ERROR.json);
    }
  }

  let params = form.cleanup({name, body});

  events.updateComment(id, commentID, params, (err, event) => {
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
