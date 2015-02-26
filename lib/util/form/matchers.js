'use strict';

var util = require('util');

/**
 *
 * @param {!string} str
 * @returns {function(string):boolean}
 */
exports.str = (str) => {
  if (!util.isString(str)) {
    throw new Error();
  }

  return (value) => {
    if (!util.isString(value)) {
      return false;
    }

    return value === str;
  };
};

/**
 *
 * @param {!RegExp} regExp
 * @returns {function(string):boolean}
 */
exports.re = (regExp) => {
  'use strict';

  if (!util.isRegExp(regExp)) {
    throw new Error();
  }

  return (value) => {
    if (!util.isString(value)) {
      return false;
    }

    return regExp.test(value);
  };
};

/**
 *
 * @param {!number} th
 * @returns {function(number):boolean}
 */
exports.ge = (th) => {
  if (!util.isNumber(th)) {
    throw new Error();
  }

  return (value) => {
    return th <= value;
  };
};
