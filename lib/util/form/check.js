var def = require('./def');

/**
 * Throws Error when a parameter matches to multiple definitions.
 * Skips sanitize when the sanitizer is undefined.
 * Skips validation when the validator is undefined.
 * Throws Error when the validator returned false.
 * Throws Error when a parameter does not match to any definition.
 * @param {!Object.<!string, Object>} target
 * @param {!Array.<!Def>} definitions
 * @returns {Object.<string, Object>} - Object which has been sanitized and validated.
 */
module.exports = function (target, definitions) {
    'use strict';

    if (!target) {
        throw new Error();
    }

    /** @type {Object.<!string, Object>} */
    var sanitized = {};

    /** @type {Array.<number>} */
    var matchCountPerDef = definitions.map(function () {
        return 0;
    });

    for (var param in target) {
        /** @type {number} */
        var matchCountPerParam = 0;

        definitions.forEach(function (def, index) {
            // Match
            if (!def.matcher(param)) {
                return;
            }
            matchCountPerParam++;
            matchCountPerDef[index]++;

            // Sanitize
            sanitized[param] = def.sanitizer(target[param]);

            // Validate
            for (var i = 0; i < def.validator.length; i++) {
                if (!def.validator[i](sanitized[param])) {
                    throw new Error('validation failed.');
                }
            }
        });

        if (1 < matchCountPerParam) {
            throw new Error('Duplicated match');
        }

        if (matchCountPerParam === 0) {
            throw new Error('Unknown parameter is detected.');
        }
    }

    // Requirements Check
    definitions.forEach(function (def, index) {
        if (!def.matchCountRange(matchCountPerDef[index])) {
            throw new Error('Invalid requirements definition.');
        }
    });

    return sanitized;
};
