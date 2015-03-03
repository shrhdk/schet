'use strict';

var $ = require('jquery');

$(() => {
  const $title = $('#event-title');

  const isEmpty = () => $title.val().trim() === '';
  const update = () => $('#create-event').prop('disabled', isEmpty());

  $title
    .keypress(ev => {
      if (ev.which !== 13 || isEmpty()) {
        return;
      }

      $('#create-event-form').submit();
    })
    .keydown(update)
    .keyup(update)
    .change(update);

  update();
});
