'use strict';

var assert = require('assert');

var whitespace = require('../../../src/util/form/constants').whitespace;
var def = require('../../../src/util/form/def');

describe('def', () => {
  it('("foo", *, *, *) make matcher by string', () => {
    let given = def('foo', true);
    let actual = given.matcher('foo');
    let expected = true;

    assert.strictEqual(actual, expected);
  });

  it('(RegExp, *, *, *) make matcher by RegExp', () => {
    let given = def(/^[a-z]+$/, true);
    let actual = given.matcher('foo');
    let expected = true;

    assert.strictEqual(actual, expected);
  });
});
