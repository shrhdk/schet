'use strict';

var util = require('util');
var assert = require('assert');
var moment = require('moment');

// Formats

const ISO_DATE = 'YYYY-MM-DD';
const ISO_DATE_TIME = 'YYYY-MM-DD[T]HH:mm[Z]';

const RE_ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;                                                          // 1936-02-06
const RE_ISO_DATE_RANGE = /^\d{4}-\d{2}-\d{2}\/\d{4}-\d{2}-\d{2}$/;                                 // 1936-02-06/1936-02-07
const RE_ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$/;                                        // 1936-02-06T00:00Z
const RE_ISO_DATE_TIME_RANGE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z\/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$/;  // 1936-02-06T00:00Z/1936-02-06T00:01Z

const PRETTY_DATE = 'YYYY/MM/DD';
const PRETTY_DATE_OMIT_YEAR = 'MM/DD';
const PRETTY_DATE_TIME = 'YYYY/MM/DD HH:mm';
const PRETTY_DATE_TIME_OMIT_YEAR = 'MM/DD HH:mm';
const PRETTY_DATE_TIME_OMIT_DATE = 'HH:mm';

const RE_PRETTY_DATE = /^\d{4}\/\d{2}\/\d{2}$/;                                 // 1999/01/01
const RE_PRETTY_DATE_RANGE = /^\d{4}\/\d{2}\/\d{2} - \d{4}\/\d{2}\/\d{2}$/;     // 1999/12/31 - 2000/01/01
const RE_PRETTY_DATE_RANGE_OMIT_YEAR = /^\d{4}\/\d{2}\/\d{2} - \d{2}\/\d{2}$/;  // 1999/01/01 - 12/31
const RE_PRETTY_DATE_TIME = /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/;                // 2000/01/01 09:00
const RE_PRETTY_DATE_TIME_RANGE = /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2} - \d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/;  // 1999/01/01 09:00 - 2000/12/31 10:00
const RE_PRETTY_DATE_TIME_RANGE_OMIT_DATE = /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2} - \d{2}:\d{2}$/; // 2000/01/01 09:00 - 10:00
const RE_PRETTY_DATE_TIME_RANGE_OMIT_YEAR = /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2} - \d{2}\/\d{2} \d{2}:\d{2}$/; // 2000/01/01 09:00 - 12/31 10:00

// Utility
var split = (str, splitter) => {
  let start, end;
  if (str.indexOf(splitter) === -1) {
    start = moment.utc(str);
    end = moment.utc(str);
  } else {
    start = moment.utc(str.split(splitter)[0]);
    end = moment.utc(str.split(splitter)[1]);
  }

  return {start, end};
};

var width = (range, unit = 'minutes') => {
  return range.end.diff(range.start, unit);
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
  str = str.replace(/\s+/g, ' ');
  str = str.replace(/(\d)-(\d)/, '$1 - $2');

  let start, end;
  if (str.indexOf(' - ') !== -1) {
    start = str.split(' - ')[0];
    end = str.split(' - ')[1];
  }

  // 1999/01/01 -> 1999-01-01
  if (RE_PRETTY_DATE.test(str)) {
    let val = moment(str, PRETTY_DATE);

    assert(val.isValid());

    return val.format(ISO_DATE);
  }

  // 1999/12/31 - 2000/01/01 -> 1999-12-31/2000-01-01
  if (RE_PRETTY_DATE_RANGE.test(str)) {
    start = moment(start, PRETTY_DATE);
    end = moment(end, PRETTY_DATE);

    assert(0 < end.diff(start));
    assert(start.isValid());
    assert(end.isValid());

    return start.format(ISO_DATE) + '/' + end.format(ISO_DATE);
  }

  // 1999/01/01 - 12/31 -> 1999-01-01/1999-12-31
  if (RE_PRETTY_DATE_RANGE_OMIT_YEAR.test(str)) {
    start = moment(start, PRETTY_DATE);
    end = moment(end, PRETTY_DATE_OMIT_YEAR);

    end.year(start.year());

    assert(0 < end.diff(start));
    assert(start.isValid());
    assert(end.isValid());

    return start.format(ISO_DATE) + '/' + end.format(ISO_DATE);
  }

  // 2000/01/01 09:00 -> 2000-01-01T00:00Z (when offset == +9)
  if (RE_PRETTY_DATE_TIME.test(str)) {
    let val = moment(str, PRETTY_DATE_TIME);

    assert(val.isValid());

    return val.subtract(offset, 'minutes').format(ISO_DATE_TIME);
  }

  // 1999/01/01 09:00 - 2000/12/31 10:00 -> 1999-01-01T00:00Z/2000-12-31T01:00Z
  if (RE_PRETTY_DATE_TIME_RANGE.test(str)) {
    start = moment(start, PRETTY_DATE_TIME);
    end = moment(end, PRETTY_DATE_TIME);

    start.subtract(offset, 'minutes');
    end.subtract(offset, 'minutes');

    assert(0 < end.diff(start));
    assert(start.isValid());
    assert(end.isValid());

    return start.format(ISO_DATE_TIME) + '/' + end.format(ISO_DATE_TIME);
  }

  // 2000/01/01 09:00 - 10:00 -> 2000-01-01T00:00Z/2000-01-01T01:00Z (when offset == +9)
  if (RE_PRETTY_DATE_TIME_RANGE_OMIT_DATE.test(str)) {
    start = moment(start, PRETTY_DATE_TIME);
    end = moment(end, PRETTY_DATE_TIME_OMIT_DATE);

    end.year(start.year());
    end.month(start.month());
    end.date(start.date());

    start.subtract(offset, 'minutes');
    end.subtract(offset, 'minutes');

    assert(0 < end.diff(start));
    assert(start.isValid());
    assert(end.isValid());

    return start.format(ISO_DATE_TIME) + '/' + end.format(ISO_DATE_TIME);
  }

  // 2000/01/01 09:00 - 12/31 10:00 -> 2000-01-01T00:00Z/2000-12-31T01:00Z (when offset == +9)
  if (RE_PRETTY_DATE_TIME_RANGE_OMIT_YEAR.test(str)) {
    start = moment(start, PRETTY_DATE_TIME);
    end = moment(end, PRETTY_DATE_TIME_OMIT_YEAR);

    end.year(start.year());

    start.subtract(offset, 'minutes');
    end.subtract(offset, 'minutes');

    assert(0 < end.diff(start));
    assert(start.isValid());
    assert(end.isValid());

    return start.format(ISO_DATE_TIME) + '/' + end.format(ISO_DATE_TIME);
  }

  throw new Error('failed to parse: ' + str);
};

// Simplify

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
var prettifyDateRange = (str) => {
  const range = split(str, '/');

  if (width(range, 'years')) {
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
var prettifyDateTimeRange = (str, offset = 0) => {
  const range = split(str, '/');

  range.start.add(offset, 'minutes');
  range.end.add(offset, 'minutes');

  if (width(range, 'years')) {
    return range.start.format(PRETTY_DATE_TIME) + ' - ' + range.end.format(PRETTY_DATE_TIME);
  }

  if (width(range, 'day')) {
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
var prettify = (str, offset = 0) => {
  str = str.trim();

  if (RE_ISO_DATE.test(str)) {
    return moment.utc(str).format(PRETTY_DATE);
  } else if (RE_ISO_DATE_TIME.test(str)) {
    return moment.utc(str).add(offset, 'minutes').format(PRETTY_DATE_TIME);
  } else if (RE_ISO_DATE_RANGE.test(str)) {
    return prettifyDateRange(str);
  } else if (RE_ISO_DATE_TIME_RANGE.test(str)) {
    return prettifyDateTimeRange(str, offset);
  } else {
    throw new Error();
  }
};

// export

module.exports = {
  compare,
  normalize,
  prettify
};
