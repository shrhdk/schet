var express = require('express');
var router = express.Router();

var errors = require('../errors');
var events = require('../models/events');

var form = require('../util/form');
var sanitizers = form.sanitizers;
var validators = form.validators;

var sortTerms = require('../util/terms-sorter');
var simplifyDateRange = require('../util/date-range-simplifier');

router.post('/', function (req, res) {
    'use strict';

    try {
        var sanitized = form.check(req.body, [
            form.def('title', true, sanitizers.strip, [validators.length(1, 255), validators.isOneLine]),
            form.def('description', false, sanitizers.strip, validators.length(0, 2048))
        ]);
    } catch (e) {
        return res.status(400).json(new errors.InvalidParameterError().json);
    }

    if (!sanitized.description) {
        sanitized.description = '';
    }

    events.create(sanitized.title, sanitized.description, function (err, event) {
        if (err || event === null) {
            return res.status(500).json(new errors.ServerSideError().json);
        }

        if (req.accepts('html')) {
            return res.redirect('/' + event.id);
        }

        return res.status(201).json(event);
    });
});

router.get('/', function (req, res) {
    'use strict';

    res.render('index');
});

router.get('/:id(\\d+)', function (req, res) {
    'use strict';

    var id = Number(req.params.id);

    events.get(id, function (err, event) {
        if (err instanceof errors.NotFoundError) {
            return res.status(err.deleted ? 410 : 404).json(err.json);
        }

        if (err) {
            return res.status(500).json(new errors.ServerSideError().json);
        }

        if (req.accepts('html')) {
            event.terms = sortTerms(event.terms);
            for (var i = 0; i < event.terms.length; i++) {
                event.terms[i].term = simplifyDateRange(event.terms[i].term);
                console.log(event.terms[i].term);
            }
            return res.status(200).render('event', {event: event});
        }

        return res.status(200).json(event);
    });
});

router.put('/:id(\\d+)', function (req, res) {
    'use strict';

    var id = Number(req.params.id);

    var emptyOrNumber = function (value) {
        return validators.isEmpty(value) || validators.ge(1)(value);
    };

    try {
        var sanitized = form.check(req.body, [
            form.def('title', false, sanitizers.strip, [validators.length(1, 255), validators.isOneLine]),
            form.def('description', false, sanitizers.strip, validators.length(0, 2048)),
            form.def('fixed', false, sanitizers.strip, emptyOrNumber)
        ]);
    } catch (e) {
        return res.status(400).json(new errors.InvalidParameterError().json);
    }

    events.put(id, sanitized, function (err, event) {
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

router.delete('/:id(\\d+)', function (req, res) {
    'use strict';

    var id = Number(req.params.id);

    events.delete(id, function (err) {
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
