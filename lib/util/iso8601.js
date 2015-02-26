'use strict';

var moment = require('moment');

// Utility

var normalize = function (str, offset) {
  offset = offset || 0;

  if (isDate(str) || isDateTime(str)) {
    return {
      start: moment.utc(str),
      end: moment.utc(str)
    }
  } else if (isDateRange(str)) {
    return {
      start: moment.utc(str.split('/')[0]),
      end: moment.utc(str.split('/')[1])
    }
  } else if (isDateTimeRange(str)) {
    return {
      start: moment.utc(str.split('/')[0]).add(offset, 'minutes'),
      end: moment.utc(str.split('/')[1]).add(offset, 'minutes')
    }
  } else {
    throw new Error();
  }
};

var diff = (range, unit) => {
  return range.start.diff(range.end, unit);
};

// Type Check

var isDate = (str) => {
  // likes 1936-02-06
  return str.match(/^\d{4}-\d{2}-\d{2}$/);
};

var isDateTime = (str) => {
  // likes 1936-02-06T00:00Z
  return str.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$/);
};

var isDateRange = (str) => {
  // likes 1936-02-06/1936-02-07
  return str.match(/^\d{4}-\d{2}-\d{2}\/\d{4}-\d{2}-\d{2}$/);
};

var isDateTimeRange = (str) => {
  // likes 1936-02-06T00:00Z/1936-02-06T00:01Z
  return str.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z\/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$/);
};

// Compare

var compare = (a, b) => {
  a = normalize(a);
  b = normalize(b);

  return a.start.diff(b.start) || a.end.diff(b.end);
};

// Simplify

var simplifyDateRange = (str) => {
  let range = normalize(str);

  if (diff(range, 'years')) {
    return range.start.format('YYYY/MM/DD') + ' - ' + range.end.format('YYYY/MM/DD');
  }

  return range.start.format('YYYY/MM/DD') + ' - ' + range.end.format('MM/DD');
};

var simplifyDateTimeRange = (str, offset) => {
  offset = offset || 0;

  let range = normalize(str, offset);

  if (diff(range, 'years')) {
    return range.start.format('YYYY/MM/DD HH:mm') + ' - ' + range.end.format('YYYY/MM/DD HH:mm');
  }

  if (diff(range, 'months') || diff(range, 'days')) {
    return range.start.format('YYYY/MM/DD HH:mm') + ' - ' + range.end.format('MM/DD HH:mm');
  }

  return range.start.format('YYYY/MM/DD HH:mm') + ' - ' + range.end.format('HH:mm');
};

var simplify = (str, offset) => {
  offset = offset || 0;

  if (isDate(str)) {
    return moment.utc(str).format('YYYY/MM/DD');
  } else if (isDateTime(str)) {
    return moment.utc(str).format('YYYY/MM/DD HH:mm');
  } else if (isDateRange(str)) {
    return simplifyDateRange(str);
  } else if (isDateTimeRange(str)) {
    return simplifyDateTimeRange(str, offset);
  } else {
    throw new Error();
  }
};

// export

module.exports = {
  compare: compare,
  simplify: simplify
};
