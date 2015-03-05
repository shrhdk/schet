'use strict';

var util = require('util');

var WHITE_SPACE = '\u0009\u000A\u000B\u000C\u000D\u0020\u0085\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u2028\u2029\u202F\u205F\u3000\u180E\u200B\u200C\u200D\u2060\uFEFF';

var DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
var DATE_RANGE = /^(\d{4})-(\d{2})-(\d{2})\/(\d{4})-(\d{2})-(\d{2})$/;
var DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})Z$/;
var DATE_TIME_RANGE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})Z\/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})Z$/;

function cleanup(obj) {
  for (let key in obj) {
    if (util.isUndefined(obj[key])) {
      delete obj[key];
    }
  }

  return obj;
}

function strictTrim(str) {
  str = str.replace(new RegExp(`^[${WHITE_SPACE}]+`), '');
  str = str.replace(new RegExp(`[${WHITE_SPACE}]+$`), '');
  return str;
}

function isSingleLine(str) {
  return (str.indexOf('\r') === -1 && str.indexOf('\n') === -1);
}

/**
 *
 * @param {!number} year
 * @param {!number} month
 * @param {!number} date
 * @returns {boolean}
 */
function isValidDate(year, month, date) {
  let d = new Date();
  d.setUTCFullYear(year);
  d.setUTCMonth(month - 1);
  d.setUTCDate(date);

  return (d.getUTCFullYear() == year && d.getUTCMonth() == month - 1 && d.getUTCDate() == date);
}

/**
 *
 * @param {!number} hours
 * @param {!number} minutes
 * @returns {boolean}
 */
function isValidTime(hours, minutes) {
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
}

/**
 *
 * @param {!string} str
 * @returns {boolean}
 */
function isDate(str) {
  if (!DATE.test(str)) {
    return false;
  }

  let m = DATE.exec(str);

  let year = Number(m[1]);
  let month = Number(m[2]);
  let date = Number(m[3]);

  return isValidDate(year, month, date);
}

/**
 *
 * @param {!string} str
 * @returns {boolean}
 */
function isDateRange(str) {
  if (!DATE_RANGE.test(str)) {
    return false;
  }

  let m = DATE_RANGE.exec(str);

  let s = {
    year: Number(m[1]),
    month: Number(m[2]),
    date: Number(m[3])
  };

  if (!isValidDate(s.year, s.month, s.date)) {
    return false;
  }

  let e = {
    year: Number(m[4]),
    month: Number(m[5]),
    date: Number(m[6])
  };

  if (!isValidDate(e.year, e.month, e.date)) {
    return false;
  }

  return s.year < e.year || s.month < e.month || s.date < e.date;
}

/**
 *
 * @param {!string} str
 * @returns {boolean}
 */
function isDateTime(str) {
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
}

/**
 *
 * @param {!string} str
 * @returns {boolean}
 */
function isDateTimeRange(str) {
  if (!DATE_TIME_RANGE.test(str)) {
    return false;
  }

  let m = DATE_TIME_RANGE.exec(str);

  let s = {
    year: Number(m[1]),
    month: Number(m[2]),
    date: Number(m[3]),
    hours: Number(m[4]),
    minutes: Number(m[5])
  };

  if (!isValidDate(s.year, s.month, s.date) || !isValidTime(s.hours, s.minutes)) {
    return false;
  }

  let e = {
    year: Number(m[6]),
    month: Number(m[7]),
    date: Number(m[8]),
    hours: Number(m[9]),
    minutes: Number(m[10])
  };

  if (!isValidDate(e.year, e.month, e.date) || !isValidTime(e.hours, e.minutes)) {
    return false;
  }

  return s.year < e.year || s.month < e.month || s.date < e.date || s.hours < e.hours || s.minutes < e.minutes;
}

function isDateString(str) {
  if (DATE.test(str)) {
    return isDate(str);
  } else if (DATE_RANGE.test(str)) {
    return isDateRange(str);
  } else if (DATE_TIME.test(str)) {
    return isDateTime(str);
  } else if (DATE_TIME_RANGE.test(str)) {
    return isDateTimeRange(str);
  }

  return false;
}

module.exports = {
  WHITE_SPACE,
  cleanup,
  strictTrim,
  isSingleLine,
  isDateString
};
