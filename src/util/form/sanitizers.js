'use strict';

var util = require('util');
var constants = require('./constants');

var stripRegExp = new RegExp('^[' + constants.whitespace + ']*(.*?)[' + constants.whitespace + ']*$');

/**
 *
 * @param {string} str
 * @returns {string}
 */
exports.strip = str => {
  return str.replace(stripRegExp, '$1');
};

exports.toBoolean = str => {
  let stripped = str.replace(stripRegExp, '$1');

  if (stripped === 'true') {
    return true;
  } else if (stripped === 'false') {
    return false;
  } else {
    throw new errors.InvalidParameterError();
  }
};

/**
 *
 * @param {string} str
 * @returns {number}
 */
exports.toNumber = str => {
  return Number(str);
};
