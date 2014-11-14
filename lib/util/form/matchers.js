require('util-is');
var util = require('util');

var proto = module.exports = {};

/**
 *
 * @param {!string} str
 * @returns {function(string):boolean}
 */
proto.str = function (str) {
    'use strict';

    if (!util.isString(str)) {
        throw new Error();
    }

    return function (value) {
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
proto.re = function (regExp) {
    'use strict';

    if (!util.isRegExp(regExp)) {
        throw new Error();
    }

    return function (value) {
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
proto.ge = function (th) {
    'use strict';

    if (!util.isNumber(th)) {
        throw new Error();
    }

    return function (value) {
        return th <= value;
    };
};
