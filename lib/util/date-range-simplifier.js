var moment = require('moment');

var isRange = function (dateString) {
    return dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z\/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$/)
        || dateString.match(/^\d{4}-\d{2}-\d{2}\/\d{4}-\d{2}-\d{2}$/);
};

var isDateOnly = function (dateString) {
    return dateString.match(/^\d{4}-\d{2}-\d{2}$/);
};

var simplifyDateRange = function (start, end) {
    var start = moment.utc(start);
    var end = moment.utc(end);

    var endStr = '';

    if (start.year() !== end.year()) {
        return start.format('YYYY/MM/DD') + ' - ' + end.format('YYYY/MM/DD');
    }

    return start.format('YYYY/MM/DD') + ' - ' + end.format('MM/DD');
};

var simplifyDateTimeRange = function (start, end) {
    var start = moment.utc(start);
    var end = moment.utc(end);

    if (start.year() !== end.year()) {
        return start.format('YYYY/MM/DD HH:mm') + ' - ' + end.format('YYYY/MM/DD HH:mm');
    }

    if (start.month() !== end.month()) {
        return start.format('YYYY/MM/DD HH:mm') + ' - ' + end.format('MM/DD HH:mm');
    }

    if (start.date() !== end.date()) {
        return start.format('YYYY/MM/DD HH:mm') + ' - ' + end.format('MM/DD HH:mm');
    }

    return start.format('YYYY/MM/DD HH:mm') + ' - ' + end.format('HH:mm');
};

module.exports = function (dateString) {
    if (!isRange(dateString)) {
        if (isDateOnly(dateString)) {
            return moment.utc(dateString).format('YYYY/MM/DD');
        } else {
            return moment.utc(dateString).format('YYYY/MM/DD HH:mm');
        }
    }

    var start = dateString.split('/')[0];
    var end = dateString.split('/')[1];

    if (isDateOnly(start)) {
        return simplifyDateRange(start, end);
    } else {
        return simplifyDateTimeRange(start, end);
    }
};
