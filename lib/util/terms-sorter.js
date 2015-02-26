var moment = require('moment');

var isRange = function (dateString) {
  return dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z\/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$/)
    || dateString.match(/^\d{4}-\d{2}-\d{2}\/\d{4}-\d{2}-\d{2}$/);
};

var normalize = function (dateString) {
  if (!isRange(dateString)) {
    return {
      start: moment.utc(dateString),
      end: moment.utc(dateString)
    }
  } else {
    return {
      start: moment.utc(dateString.split('/')[0]),
      end: moment.utc(dateString.split('/')[1])
    }
  }
};

var compare = function (a, b) {
  return a.diff(b);
};

module.exports = function (terms) {
  var array = [];
  for (var termID in terms) {
    array.push({
      id: termID,
      term: terms[termID]
    });
  }

  return array.sort(function (a, b) {
    a = normalize(a.term);
    b = normalize(b.term);

    var resultOfStart = compare(a.start, b.start);

    if (resultOfStart == 0) {
      return compare(a.end, b.end);
    }

    return resultOfStart;
  });
};
