window.addEventListener('load', function () {
  var _newEventForm = document.querySelector('#new-event-form');
  var _newEventTitleField = document.querySelector('#new-event-title-field');
  var _newEventButton = document.querySelector('#new-event-button');

  var updateNewEventButton = function () {
    var val = _newEventTitleField.value.replace(/^\s*(.*?)\s*$/, "$1");
    _newEventButton.disabled = (val === "");
  };

  _newEventTitleField.addEventListener('keypress', function (ev) {
    if (ev.which !== 13) {  // !== Enter
      return;
    }

    var val = _newEventTitleField.value.replace(/^\s*(.*?)\s*$/, "$1");

    if (val === '') {
      return;
    }

    _newEventForm.submit();
  });

  _newEventTitleField.addEventListener('keydown', function () {
    updateNewEventButton();
  });

  _newEventTitleField.addEventListener('keyup', function () {
    updateNewEventButton();
  });

  _newEventTitleField.addEventListener('change', function () {
    updateNewEventButton();
  });

  updateNewEventButton();
});
