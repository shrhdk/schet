'use strict';

var $ = require('jquery');

$(() => {
  const $title = $('#new-event-title-field');

  const isEmpty = () => $title.val().trim() === '';
  const update = () => $('#new-event-button').prop('disabled', isEmpty());

  $title
    .keypress((ev) => {
      if (ev.which !== 13 || isEmpty()) {
        return;
      }

      $('#new-event-form').submit();
    })
    .keydown(update)
    .keyup(update)
    .change(update);

  update();
});
