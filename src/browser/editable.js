'use strict';

module.exports = function (cb) {
  let snapshot = this.text();

  let abort = () => {
    this.text(snapshot);
    this.prop('contentEditable', false);
  };

  let fallback = () => {
    this.text(snapshot);
    this.prop('contentEditable', true);
    this.focus();
  };

  // Start Edit
  this.click(() => {
    snapshot = this.text();
    this.prop('contentEditable', true);
    this.focus();
  });

  // Cancel (by ESC)
  this.keydown(ev => {
    if (ev.which !== 27) {  // !== Esc
      return;
    }

    this.text(snapshot);
    this.prop('contentEditable', false);
    this.blur();
  });

  // Fix (by Blur)
  this.blur(() => {
    this.prop('contentEditable', false);
    cb(this, fallback, abort);
  });

  // Fix (by Enter)
  this.keypress(ev => {
    if (ev.which === 13) {  // Enter
      this.blur();
    }
  });

  return this;
};