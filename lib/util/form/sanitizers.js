var util = require('util');
var constants = require('./constants');

var stripRegExp = new RegExp('^[' + constants.whitespace + ']*(.*?)[' + constants.whitespace + ']*$');

var proto = module.exports = {};

/**
 *
 * @param {string} str
 * @returns {string}
 */
proto.strip = function (str) {
  'use strict';

  return str.replace(stripRegExp, '$1');
};

proto.toBoolean = function (str) {
  'use strict';

  var stripped = str.replace(stripRegExp, '$1');

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
proto.toNumber = function (str) {
  'use strict';

  return Number(str);
};
