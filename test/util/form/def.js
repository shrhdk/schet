/*eslint strict:0*/

var assert = require('power-assert');

var whitespace = require('../../../lib/util/form/constants').whitespace;
var def = require('../../../lib/util/form/def');

describe('def', function () {
  it('("foo", *, *, *) make matcher by string', function () {
    var given = def('foo', true);
    var actual = given.matcher('foo');
    var expected = true;

    assert(actual === expected);
  });

  it('(RegExp, *, *, *) make matcher by RegExp', function () {
    var given = def(/^[a-z]+$/, true);
    var actual = given.matcher('foo');
    var expected = true;

    assert(actual === expected);
  });
});
