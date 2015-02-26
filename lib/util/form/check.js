'use strict';

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
module.exports = (target, definitions) => {
  if (!target) {
    throw new Error();
  }

  /** @type {Object.<!string, Object>} */
  let sanitized = {};

  /** @type {Array.<number>} */
  let matchCountPerDef = definitions.map(() => {
    return 0;
  });

  for (let param in target) {
    /** @type {number} */
    let matchCountPerParam = 0;

    definitions.forEach((def, index) => {
      // Match
      if (!def.matcher(param)) {
        return;
      }
      matchCountPerParam++;
      matchCountPerDef[index]++;

      // Sanitize
      sanitized[param] = def.sanitizer(target[param]);

      // Validate
      for (let i = 0; i < def.validator.length; i++) {
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
  definitions.forEach((def, index) => {
    if (!def.matchCountRange(matchCountPerDef[index])) {
      throw new Error('Invalid requirements definition.');
    }
  });

  return sanitized;
};
