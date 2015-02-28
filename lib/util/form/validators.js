'use strict';

var util = require('util');
var assert = require('assert');
var constants = require('./constants');

var whitespaceRegExp = new RegExp('^[' + constants.whitespace + ']*$');
var DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
var DATE_RANGE = /^(\d{4})-(\d{2})-(\d{2})\/(\d{4})-(\d{2})-(\d{2})$/;
var DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})Z$/;
var DATE_TIME_RANGE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})Z\/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})Z$/;

/**
 *
 * @param {!number} year
 * @param {!number} month
 * @param {!number} date
 * @returns {boolean}
 */
var isValidDate = (year, month, date) => {
  let d = new Date();
  d.setUTCFullYear(year);
  d.setUTCMonth(month - 1);
  d.setUTCDate(date);

  return (d.getUTCFullYear() == year && d.getUTCMonth() == month - 1 && d.getUTCDate() == date);
};

/**
 *
 * @param {!number} hours
 * @param {!number} minutes
 * @returns {boolean}
 */
var isValidTime = (hours, minutes) => {
  if (hours === 24 && minutes !== 0) {
    return false;
  }

  if (hours < 0 || 24 < hours) {
    return false;
  }

  if (minutes < 0 || 59 < minutes) {
    return false;
  }

  return true;
};

exports.isEmpty = (value) => {
  return value === '';
};

exports.isNotWhitespace = (value) => {
  return !whitespaceRegExp.test(value);
};

exports.isOneLine = (str) => {
  return (str.indexOf('\r') === -1 && str.indexOf('\n') === -1);
};

/**
 * @param {...*}
 */
exports.list = (...args) => {
  assert(1 <= args.length);

  return (value) => {
    for (let i = 0; i < args.length; i++) {
      if (args[i] === value) {
        return true;
      }
    }
    return false;
  };
};

exports.ge = (th) => {
  'use strict';

  if (!util.isNumber(th)) {
    throw new Error();
  }

  return (value) => {
    return th <= value;
  };
};

/**
 *
 * @param {!number} ge
 * @param {!number=} le
 * @returns {function(number):boolean}
 */
exports.range = (ge, le) => {
  if (!util.isNumber(ge) || !util.isNumber(le)) {
    throw new Error();
  }

  if (le < ge) {
    throw new Error();
  }

  return (value) => {
    return ge <= value && value <= le;
  };
};

exports.length = (ge, le) => {
  if (!util.isNumber(ge) || !util.isNumber(le)) {
    throw new Error();
  }

  if (ge < 0 || le < ge) {
    throw new Error();
  }

  return (str) => {
    if (!util.isString(str)) {
      return false;
    }

    return ge <= str.length && str.length <= le;
  };
};

/**
 *
 * @param {!string} str
 * @returns {boolean}
 */
exports.isDate = (str) => {
  if (!DATE.test(str)) {
    return false;
  }

  let m = DATE.exec(str);

  let year = Number(m[1]);
  let month = Number(m[2]);
  let date = Number(m[3]);

  return isValidDate(year, month, date);
};

/**
 *
 * @param {!string} str
 * @returns {boolean}
 */
exports.isDateRange = (str) => {
  if (!DATE_RANGE.test(str)) {
    return false;
  }

  let m = DATE_RANGE.exec(str);

  let s = {};
  s.year = Number(m[1]);
  s.month = Number(m[2]);
  s.date = Number(m[3]);

  if (!isValidDate(s.year, s.month, s.date)) {
    return false;
  }

  let e = {};
  e.year = Number(m[4]);
  e.month = Number(m[5]);
  e.date = Number(m[6]);

  if (!isValidDate(e.year, e.month, e.date)) {
    return false;
  }

  return s.year < e.year || s.month < e.month || s.date < e.date;
};

/**
 *
 * @param {!string} str
 * @returns {boolean}
 */
exports.isDateTime = (str) => {
  if (!DATE_TIME.test(str)) {
    return false;
  }
  let m = DATE_TIME.exec(str);

  let year = Number(m[1]);
  let month = Number(m[2]);
  let date = Number(m[3]);
  let hours = Number(m[4]);
  let minutes = Number(m[5]);

  return isValidDate(year, month, date) && isValidTime(hours, minutes);
};

/**
 *
 * @param {!string} str
 * @returns {boolean}
 */
exports.isDateTimeRange = (str) => {
  if (!DATE_TIME_RANGE.test(str)) {
    return false;
  }

  let m = DATE_TIME_RANGE.exec(str);

  let s = {};
  s.year = Number(m[1]);
  s.month = Number(m[2]);
  s.date = Number(m[3]);
  s.hours = Number(m[4]);
  s.minutes = Number(m[5]);

  if (!isValidDate(s.year, s.month, s.date) || !isValidTime(s.hours, s.minutes)) {
    return false;
  }

  let e = {};
  e.year = Number(m[6]);
  e.month = Number(m[7]);
  e.date = Number(m[8]);
  e.hours = Number(m[9]);
  e.minutes = Number(m[10]);

  if (!isValidDate(e.year, e.month, e.date) || !isValidTime(e.hours, e.minutes)) {
    return false;
  }

  return s.year < e.year || s.month < e.month || s.date < e.date || s.hours < e.hours || s.minutes < e.minutes;
};

exports.isDateString = (str) => {
  if (DATE.test(str)) {
    return exports.isDate(str);
  } else if (DATE_RANGE.test(str)) {
    return exports.isDateRange(str);
  } else if (DATE_TIME.test(str)) {
    return exports.isDateTime(str);
  } else if (DATE_TIME_RANGE.test(str)) {
    return exports.isDateTimeRange(str);
  }

  return false;
};
