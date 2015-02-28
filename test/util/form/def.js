'use strict';

var assert = require('power-assert');

var whitespace = require('../../../src/util/form/constants').whitespace;
var def = require('../../../src/util/form/def');

describe('def', function () {
  it('("foo", *, *, *) make matcher by string', function () {
    let given = def('foo', true);
    let actual = given.matcher('foo');
    let expected = true;

    assert(actual === expected);
  });

  it('(RegExp, *, *, *) make matcher by RegExp', function () {
    let given = def(/^[a-z]+$/, true);
    let actual = given.matcher('foo');
    let expected = true;

    assert(actual === expected);
  });
});
