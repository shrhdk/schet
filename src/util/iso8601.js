'use strict';

var util = require('util');
var assert = require('assert');
var moment = require('moment');

// Utility

var split = (str, splitter) => {
  if (str.indexOf(splitter) === -1) {
    return {
      start: moment.utc(str),
      end: moment.utc(str)
    }
  } else {
    return {
      start: moment.utc(str.split('/')[0]),
      end: moment.utc(str.split('/')[1])
    }
  }
};

var diff = (range, unit) => {
  return range.start.diff(range.end, unit);
};

// Compare

/**
 * Compare ISO8601 date time string and range string.
 *
 * @param {String} a
 * @param {String} b
 * @returns {Number}
 */
var compare = (a, b) => {
  a = split(a, '/');
  b = split(b, '/');

  return a.start.diff(b.start) || a.end.diff(b.end);
};

// Normalize

const ISO_DATE = 'YYYY-MM-DD';
const ISO_DATE_TIME = 'YYYY-MM-DD[T]HH:mm[Z]';

const RE_PRETTY_DATE = /^\d{4}\/\d{2}\/\d{2}$/;                                 // 1999/01/01
const RE_PRETTY_DATE_RANGE = /^\d{4}\/\d{2}\/\d{2} - \d{4}\/\d{2}\/\d{2}$/;     // 1999/12/31 - 2000/01/01
const RE_PRETTY_DATE_RANGE_OMIT_YEAR = /^\d{4}\/\d{2}\/\d{2} - \d{2}\/\d{2}$/;  // 1999/01/01 - 12/31
const RE_PRETTY_DATE_TIME = /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/;                // 2000/01/01 09:00
const RE_PRETTY_DATE_TIME_RANGE = /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2} - \d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/;  // 1999/01/01 09:00 - 2000/12/31 10:00
const RE_PRETTY_DATE_TIME_RANGE_OMIT_DATE = /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2} - \d{2}:\d{2}$/; // 2000/01/01 09:00 - 10:00
const RE_PRETTY_DATE_TIME_RANGE_OMIT_YEAR = /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2} - \d{2}\/\d{2} \d{2}:\d{2}$/; // 2000/01/01 09:00 - 12/31 10:00

/**
 * Normalize the date time string from pretty format.
 *
 * input formats:
 * 1999/01/01
 * 1999/01/01 - 12/31
 * 1999/12/31 - 2000/01/01
 * 2000/01/01 00:00
 * 2000/01/01 00:00 - 11:00
 * 2000/01/01 00:00 - 01/02 11:00
 * 2000/01/01 00:00 - 2000/01/01 11:00
 *
 * output formats:
 * 1999-01-01
 * 1999-01-01/1999-12-31
 * 2000-01-01T00:00Z
 * 2000-01-01T00:00Z/2000-01-01T11:00Z
 *
 * @param {String} str
 * @param {Number} offset
 * @returns {String}
 */
var normalize = (str, offset = 0) => {
  str = str.trim();

  // 1999/01/01 -> 1999-01-01
  if (str.test(RE_PRETTY_DATE)) {
    return moment(str).format(ISO_DATE);
  }

  // 1999/12/31 - 2000/01/01 -> 1999-12-31/2000-01-01
  if (str.test(RE_PRETTY_DATE_RANGE)) {
    let range = split(str, ' - ');
    return range.start.format(ISO_DATE) + '/' + range.end.format(ISO_DATE);
  }

  // 1999/01/01 - 12/31 -> 1999-01-01/1999-12-31
  if (str.test(RE_PRETTY_DATE_RANGE_OMIT_YEAR)) {
    let range = split(str, ' - ');

    range.end.year(range.start.year());

    return range.start.format(ISO_DATE) + '/' + range.end.format(ISO_DATE);
  }

  // 2000/01/01 09:00 -> 2000-01-01T00:00Z (when offset == +9)
  if (str.test(RE_PRETTY_DATE_TIME)) {
    return moment(str).add(offset, 'minutes').format(ISO_DATE_TIME);
  }

  // 1999/01/01 09:00 - 2000/12/31 10:00 -> 1999-01-01T00:00Z/2000-12-31T01:00Z
  if (str.test(RE_PRETTY_DATE_TIME_RANGE)) {
    let range = split(str, ' - ');

    range.start.add(offset, 'minutes');
    range.end.add(offset, 'minutes');

    return range.start.format(ISO_DATE_TIME) + '/' + range.end.format(ISO_DATE_TIME);
  }

  // 2000/01/01 09:00 - 10:00 -> 2000-01-01T00:00Z/2000-01-01T01:00Z (when offset == +9)
  if (str.test(RE_PRETTY_DATE_TIME_RANGE_OMIT_DATE)) {
    let range = split(str, ' - ');

    range.end.year(range.start.year());
    range.end.month(range.start.month());
    range.end.date(range.start.date());

    range.start.add(offset, 'minutes');
    range.end.add(offset, 'minutes');

    return range.start.format(ISO_DATE_TIME) + '/' + range.end.format(ISO_DATE_TIME);
  }

  // 2000/01/01 09:00 - 12/31 10:00 -> 2000-01-01T00:00Z/2000-12-31T01:00Z (when offset == +9)
  if (str.test(RE_PRETTY_DATE_TIME_RANGE_OMIT_YEAR)) {
    let range = split(str, ' - ');

    range.end.year(range.start.year());

    range.start.add(offset, 'minutes');
    range.end.add(offset, 'minutes');

    return range.start.format(ISO_DATE_TIME) + '/' + range.end.format(ISO_DATE_TIME);
  }

  throw new Error('failed to parse: ' + str);
};

// Simplify

const PRETTY_DATE = 'YYYY/MM/DD';
const PRETTY_DATE_OMIT_YEAR = 'MM/DD';
const PRETTY_DATE_TIME = 'YYYY/MM/DD HH:mm';
const PRETTY_DATE_TIME_OMIT_YEAR = 'MM/DD HH:mm';
const PRETTY_DATE_TIME_OMIT_DATE = 'HH:mm';

const RE_DATE = /^\d{4}-\d{2}-\d{2}$/;                                                          // 1936-02-06
const RE_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$/;                                        // 1936-02-06T00:00Z
const RE_DATE_RANGE = /^\d{4}-\d{2}-\d{2}\/\d{4}-\d{2}-\d{2}$/;                                 // 1936-02-06/1936-02-07
const RE_DATE_TIME_RANGE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z\/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$/;  // 1936-02-06T00:00Z/1936-02-06T00:01Z

/**
 * Prettify the date time string from ISO8601 format.
 *
 * input formats:
 * 1999-01-01/1999-12-31
 *
 * output formats:
 * 1999/01/01 - 12/31
 * 1999/12/31 - 2000/01/01
 *
 * @param {String} str
 * @returns {String}
 */
var simplifyDateRange = (str) => {
  const range = split(str, '/');

  if (diff(range, 'years')) {
    return range.start.format(PRETTY_DATE) + ' - ' + range.end.format(PRETTY_DATE);
  }

  return range.start.format(PRETTY_DATE) + ' - ' + range.end.format(PRETTY_DATE_OMIT_YEAR);
};

/**
 * Prettify the date time string from ISO8601 format.
 *
 * input formats:
 * 2000-01-01T00:00Z/2000-01-01T11:00Z
 *
 * output formats:
 * 2000/01/01 00:00 - 11:00
 * 2000/01/01 00:00 - 01/02 11:00
 * 2000/01/01 00:00 - 2000/01/01 11:00
 *
 * @param {String} str
 * @param {Number} offset
 * @returns {String}
 */
var simplifyDateTimeRange = (str, offset = 0) => {
  const range = split(str, '/');

  range.start.add(offset, 'minutes');
  range.end.add(offset, 'minutes');

  if (diff(range, 'years')) {
    return range.start.format(PRETTY_DATE_TIME) + ' - ' + range.end.format(PRETTY_DATE_TIME);
  }

  if (diff(range, 'months') || diff(range, 'dates')) {
    return range.start.format(PRETTY_DATE_TIME) + ' - ' + range.end.format(PRETTY_DATE_TIME_OMIT_YEAR);
  }

  return range.start.format(PRETTY_DATE_TIME) + ' - ' + range.end.format(PRETTY_DATE_TIME_OMIT_DATE);
};

/**
 * Prettify the date time string from ISO8601 format.
 *
 * input formats:
 * 1999-01-01
 * 1999-01-01/1999-12-31
 * 2000-01-01T00:00Z
 * 2000-01-01T00:00Z/2000-01-01T11:00Z
 *
 * output formats:
 * 1999/01/01
 * 1999/01/01 - 12/31
 * 1999/12/31 - 2000/01/01
 * 2000/01/01 00:00
 * 2000/01/01 00:00 - 11:00
 * 2000/01/01 00:00 - 01/02 11:00
 * 2000/01/01 00:00 - 2000/01/01 11:00
 *
 * @param {String} str
 * @param {Number} offset - offset in minutes
 * @returns {String}
 */
var simplify = (str, offset = 0) => {
  str = str.trim();

  if (str.test(RE_DATE)) {
    return moment.utc(str).format(PRETTY_DATE);
  } else if (str.test(RE_DATE_TIME)) {
    return moment.utc(str).add(offset, 'minutes').format(PRETTY_DATE_TIME);
  } else if (str.test(RE_DATE_RANGE)) {
    return simplifyDateRange(str);
  } else if (str.test(RE_DATE_TIME_RANGE)) {
    return simplifyDateTimeRange(str, offset);
  } else {
    throw new Error();
  }
};

// export

module.exports = {
  compare,
  normalize,
  simplify
};
