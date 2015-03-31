'use strict';

var assert = require('assert');
var GiveAndExpect = require('../test-helper').GiveAndExpect;

var form = require('../../src/util/form.js');

describe('form', () => {
  describe('strictTrim', () => {
    let test = new GiveAndExpect(form.strictTrim);

    it('trim whitespace',
      test.give(form.WHITE_SPACE + 'foo' + form.WHITE_SPACE).expect('foo'));
  });
});
