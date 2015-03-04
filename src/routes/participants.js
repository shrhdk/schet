'use strict';

var util = require('util');

var express = require('express');
var router = express.Router();

var ERRORS = require('../errors');
var events = require('../models/events');

var form = require('../util/form');

router.post('/:id(\\d+)/participants', (req, res) => {
  const id = req.params.id;

  // name
  let name = req.body['name'];
  name = name && name.trim();
  if (!name || name.length < 1 || 255 < name.length || !form.isSingleLine(name)) {
    return res.status(400).json(ERRORS.INVALID_PARAMETER_ERROR.json);
  }

  // Term ID and presence
  let data = {};
  for (let termID in req.body) {
    if (1 < termID) {
      data[termID] = req.body[termID].trim();
      if (['presence', 'absence', 'uncertain'].indexOf(data[termID]) !== -1) {
        return res.status(400).json(ERRORS.INVALID_PARAMETER_ERROR.json);
      }
    }
  }

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

  // name
  let name = req.body['name'];
  if (!util.isUndefined(name)) {
    name = name.trim();
    if (name.length < 1 || 255 < name.length || !form.isSingleLine(name)) {
      return res.status(400).json(ERRORS.INVALID_PARAMETER_ERROR.json);
    }
  }

  // Term ID and presence
  let data = {name};
  for (let termID in req.body) {
    if (1 < termID) {
      data[termID] = req.body[termID].trim();
      if (['presence', 'absence', 'uncertain'].indexOf(data[termID]) !== -1) {
        return res.status(400).json(ERRORS.INVALID_PARAMETER_ERROR.json);
      }
    }
  }

  form.cleanup(data);

  events.updateParticipant(id, participantID, data, (err, event) => {
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
