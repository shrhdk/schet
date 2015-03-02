'use strict';

var $ = require('jquery');
var moment = require('moment');
var Schet = require('./schet').Schet;
var iso8601 = require('../util/iso8601');

$(() => {
  let eventID = location.pathname.substring(1);
  let schet = new Schet(eventID);

  // Helper

  let makeEditable = (element, multiline, cb) => {
    element = $(element);

    let snapshot = element.text();

    // Back function for fall back
    let back = () => {
      element.text(snapshot);
      element.prop('contentEditable', true);
      element.focus();
    };

    // Start Edit
    element.click(() => {
      element.prop('contentEditable', true);
      element.focus();
    });

    // Cancel (by ESC)
    element.keydown(ev => {
      if (ev.which !== 27) {  // !== Esc
        return;
      }

      element.text(snapshot);
      element.prop('contentEditable', false);
      element.blur();
    });

    // Fix (by Blur)
    element.blur(() => {
      element.prop('contentEditable', false);
      cb(element.text(), back);
    });

    // Fix (by Enter)
    if (!multiline) {
      element.keypress(ev => {
        if (ev.which === 13) {  // Enter
          element.blur();
        }
      });
    }
  };

  // Simplify Terms

  $('.term').each((index, element) => {
    element.innerText = iso8601.prettify(element.innerText.trim(), moment().utcOffset());
  });

  // Fix and Unfix Event

  $('.fix-event-checkbox').each((index, element) => {
    $(element).change(() => {
      let termID = element.getAttribute('term-id');

      if (element.checked) {
        schet.fix(termID).then(event => location.reload())
          .catch(err => location.reload());
      } else {
        schet.unfix(termID).then(event => location.reload())
          .catch(err => location.reload());
      }
    });
  });

  // Edit Event Title
  $('#title').each((index, element) => {
    makeEditable(element, false, (text, back) => {
      schet.update({title: text})
        .catch(err => {
          alert(err);
          back();
        });
    });
  });

  // Edit Event Description
  $('#description').each((index, element) => {
    makeEditable(element, true, text => {
      schet.update({description: text})
        .catch(err => {
          alert(err);
          back();
        });
    });
  });

  // Add Participant
  $('#new-participant-button').click(() => {
    let name = $('#new-participant-name').val();

    let schedule = {};
    $('.new-record').each((index, element) => {
      let termID = element.getAttribute('term-id');
      schedule[termID] = element.value;
    });

    schet.addParticipant(name, schedule).then(() => location.reload())
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
  $('.participant-name').each((index, element) => {
    let participantID = element.getAttribute('participant-id');

    makeEditable(element, false, text => {
      schet.updateParticipant(participantID, {name: text})
        .catch(() => location.reload());
    });
  });

  $('.delete-participant').each((index, element) => {
    let participantID = element.getAttribute('participant-id');

    $(element).click(() => {
      schet.deleteParticipant(participantID).then(() => location.reload())
        .catch(() => location.reload());
    });
  });

  // Add Term
  $('#new-term-button').click(() => {
    let term;
    try {
      term = iso8601.normalize(
        $('#new-term-field').val(),
        moment().utcOffset()
      );
    } catch (e) {
      alert(e);
      return;
    }

    // Send to Server
    schet.addTerm(term).then(() => location.reload())
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
  $('.delete-term').each((index, element) => {
    let termID = element.getAttribute('term-id');

    $(element).click(() => {
      schet.deleteTerm(termID).then(() => location.reload())
        .catch(() => location.reload());
    });
  });

  // Edit Record
  $('select.record').each((index, element) => {
    let participantID = element.getAttribute('participant-id');
    let termID = element.getAttribute('term-id');

    $(element).change(() => {
      let data = {};
      data[termID] = element.value;
      schet.updateParticipant(participantID, data)
        .catch(() => location.reload());
    });
  });

  // Add Comment
  $('#comment-form').submit(() => {
    let name = $('#comment-name-field').val();
    let body = $('#comment-body-field').val();

    schet.addComment(name, body).then(() => location.reload())
      .catch(err => {
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
  $('.comment').each((index, element) => {
    let commentID = element.getAttribute('comment-id');

    $(element).find('.comment-name')
  });
  $('.comment-name').each((index, element) => {
    let commentID = element.getAttribute('comment-id');

    makeEditable(element, false, (text, back) => {
      schet.updateComment(commentID, {name: text})
        .catch(err => {
          alert(err);
          back();
        });
    });
  });

  // Edit Comment Body
  $('.comment-body').each((index, element) => {
    let commentID = element.getAttribute('comment-id');

    makeEditable(element, false, (text, back) => {
      schet.updateComment(commentID, {body: text})
        .catch(err => {
          alert(err);
          back();
        });
    });
  });

  // Delete Comment
  $('.delete-comment').each((index, element) => {
    let commentID = element.getAttribute('comment-id');

    $(element).click(() => {
      schet.deleteComment(commentID).then(() => location.reload())
        .catch(() => location.reload());
    });
  });
});
