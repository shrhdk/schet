'use strict';

var util = require('util');
var matchers = require('./matchers');
var validators = require('./validators');

class Def {
  constructor(matcher, required, sanitizer, validator) {
    // Normalize mather
    if (matcher && matcher.constructor === String) {
      this.matcher = matchers.str(matcher);
    } else if (util.isRegExp(matcher)) {
      this.matcher = matchers.re(matcher);
    } else if (util.isFunction(matcher)) {
      this.matcher = matcher;
    } else {
      throw new Error('Invalid matcher');
    }

    // Normalize required
    if (util.isBoolean(required)) {
      this.matchCountRange = required
        ? validators.range(1, 1)
        : validators.range(0, 1);
    } else if (util.isNumber(required)) {
      this.matchCountRange = validators.ge(required);
    } else {
      throw new Error('Invalid required');
    }

    // Normalize sanitizer
    if (util.isUndefined(sanitizer)) {
      this.sanitizer = (value) => {
        return value;
      };
    } else if (util.isFunction(sanitizer)) {
      this.sanitizer = sanitizer;
    } else {
      throw new Error('Invalid sanitizer');
    }

    // Normalize validator
    if (util.isUndefined(validator)) {
      this.validator = [() => {
        return true;
      }];
    } else if (util.isFunction(validator)) {
      this.validator = [validator];
    } else if (util.isArray(validator)) {
      this.validator = validator;
    } else {
      throw new Error('Invalid validator');
    }

    // Make Immutable
    Object.freeze(this);
  }
}

/**
 *
 * @param {!string||!RegExp||!function(string):boolean} matcher
 * @param {!boolean||!number} required
 * @param {function(Object):Object=} sanitizer
 * @param {function(Object):boolean||Array.<function(Object):boolean>=} validator
 * @returns {Def}
 */
module.exports = (matcher, required, sanitizer, validator) => {
  return new Def(matcher, required, sanitizer, validator);
};
