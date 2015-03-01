'use strict';

var $ = require('jquery');
var moment = require('moment');
var Schet = require('./schet');
var iso8601 = require('../util/iso8601');

$(() => {
  const eventID = location.pathname.substring(1);
  const schet = new Schet(eventID);

  // Date Format
  const dateFormat = 'YYYY/MM/DD HH:mm';
  const rangeSeparator = ' - ';

  // Helper

  const makeEditable = (elem, multiline, cb) => {
    elem = $(elem);

    const snapshot = elem.text();

    // Back function for fall back
    const back = () => {
      elem.text(snapshot);
      elem.prop('contentEditable', true);
      elem.focus();
    };

    // Start Edit
    elem.click(() => {
      elem.prop('contentEditable', true);
      elem.focus();
    });

    // Cancel (by ESC)
    elem.keydown((ev) => {
      if (ev.which !== 27) {  // !== Esc
        return;
      }

      elem.text(snapshot);
      elem.prop('contentEditable', false);
      elem.blur();
    });

    // Fix (by Blur)
    elem.blur(() => {
      elem.contentEditable = false;
      cb(elem.innerText, back);
    });

    // Fix (by Enter)
    if (!multiline) {
      elem.keypress((ev) => {
        if (ev.which === 13) {  // Enter
          elem.blur();
        }
      });
    }
  };

  // Simplify Terms

  $('.term').each(() => {
    this.innerText = iso8601.simplify(this.innerText.trim(), moment().utcOffset());
  });

  // Set up Date Time Picker
  $('input[name="daterange"]').daterangepicker(
    {
      format: dateFormat,
      startDate: moment().startOf('day').add(9, 'hour'),
      endDate: moment().startOf('day').add(17, 'hour'),
      separator: rangeSeparator,
      timePicker: true,
      timePickerIncrement: 10,
      timePicker12Hour: false
    }
  );

  // Fix and Unfix Event

  $('.fix-event-checkbox').each(() => {
    $(this).change(() => {
      const termID = _fixEventCheckbox.getAttribute('term-id');

      if (this.checked) {
        schet.fix(termID).then((event) => {
          location.reload();
        }).catch((err) => {
          location.reload();
        });
      } else {
        schet.unfix(termID).then((event) => {
          location.reload();
        }).catch((err) => {
          location.reload();
        });
      }
    });
  });

  // Edit Event Title
  $('#title').each(() => {
    makeEditable(this, false, (text, back) => {
      schet.update({title: text})
        .catch((err) => {
          alert(err);
          back();
        });
    });
  });

  // Edit Event Description
  $('#description').each(() => {
    makeEditable(this, true, (text) => {
      schet.update({description: text})
        .catch((err) => {
          alert(err);
          back();
        });
    });
  });

  // Add Participant
  $('#new-participant-button').click(() => {
    const name = $('#new-participant-name').val();

    const schedule = {};
    $('.new-record').each(() => {
      const termID = this.getAttribute('term-id');
      data[termID] = this.value;
    });

    schet.addParticipant(name, schedule).then(location.reload)
      .catch(function (err) {
        // TODO Correct Error Handling
        switch (err.status) {
          case 400:
            alert(err.message);
            break;
          case 404:
            alert(err.message);
            location.reload();
            break;
          default:
            location.reload();
        }
      });
  });

  // Edit Participant Name
  $('.participant-name').each(() => {
    const participantID = this.getAttribute('participant-id');

    makeEditable(this, false, (text) => {
      schet.updateParticipant(participantID, {name: text})
        .catch(location.reload);
    });
  });

  $('.delete-participant').each(() => {
    const participantID = this.getAttribute('participant-id');

    $(this).click(() => {
      schet.deleteParticipant(participantID).then(location.reload)
        .catch(location.reload);
    });
  });

  // Add Term
  $('#new-term-button').click(() => {
    const newTerm = $('#new-term-field').val();

    if (newTerm == "") {
      return;
    }

    // Split Range
    let startDate = newTerm.split(rangeSeparator)[0];
    let endDate = newTerm.split(rangeSeparator)[1];

    // Convert to Normal Format
    startDate = moment(startDate, dateFormat).utc().format('YYYY-MM-DDTHH:mm[Z]');
    endDate = moment(endDate, dateFormat).utc().format('YYYY-MM-DDTHH:mm[Z]');

    const term = startDate + '/' + endDate;

    // Send to Server
    schet.addTerm(term).then(location.reload)
      .catch((err) => {
        // TODO Correct Error Handling
        switch (err.status) {
          case 400:
            alert(err.reason);
            location.reload();
            break;
          case 404:
            alert(err.reason);
            location.reload();
            break;
          default:
            location.reload();
        }
      });
  });

  // Delete Term
  $('.delete-term').each(() => {
    const termID = this.getAttribute('term-id');

    $(this).click(() => {
      schet.deleteTerm(termID).then(location.reload)
        .catch(location.reload);
    });
  });

  // Edit Record
  $('select.record').each(() => {
    const participantID = this.getAttribute('participant-id');
    const termID = this.getAttribute('term-id');

    $(this).change(() => {
      const data = {};
      data[termID] = this.value;
      schet.updateParticipant(participantID, data)
        .catch(location.reload());
    });
  });

  // Add Comment
  $('#comment-form').sbmit(() => {
    const name = $('#comment-name-field').val();
    const body = $('#comment-body-field').val();

    schet.addComment(name, body).then(location.reload)
      .catch((err) => {
        switch (err.status) {
          case 400:
            alert(err.message);
            break;
          case 404:
            alert(err.message);
            location.reload();
            break;
          default:
            location.reload();
        }
      });

    return false;
  });

  // Edit Comment Name
  $('.comment-name').each(() => {
    const commentID = this.getAttribute('comment-id');

    makeEditable(this, false, (text, back) => {
      schet.updateComment(commentID, {name: text})
        .catch((err) => {
          alert(err);
          back();
        });
    });
  });

  // Edit Comment Body
  $('.comment-body').each(() => {
    const commentID = this.getAttribute('comment-id');

    makeEditable(this, false, (text, back) => {
      schet.updateComment(commentID, {body: text})
        .catch((err) => {
          alert(err);
          back();
        });
    });
  });

  // Delete Comment
  $('.delete-comment').each(() => {
    const commentID = this.getAttribute('comment-id');

    $(this).click(() => {
      schet.deleteComment(commentID).then(location.reload)
        .catch(location.reload);
    });
  });
});
