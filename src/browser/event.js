'use strict';

var $ = require('jquery');
var autosize = require('autosize');
var moment = require('moment');
var Schet = require('./schet').Schet;
var iso8601 = require('../util/iso8601');

$(() => {
  let eventID = location.pathname.substring(1);
  let schet = new Schet(eventID);
  let isFixed = false;

  // Workaround for Firefox cache.

  $('input[type=checkbox]').each(function () {
    let truth = $(this).attr('checked') === 'checked';
    $(this).prop('checked', truth);
  });

  // isFixed

  $('.fix-event').each(function () {
    if ($(this).prop('checked')) {
      isFixed = true;
    }
  });

  // Helper

  $.fn.editable = function (cb) {
    let snapshot = this.text();

    // Back function for fall back
    let back = () => {
      this.text(snapshot);
      this.prop('contentEditable', true);
      this.focus();
    };

    // Start Edit
    this.click(() => {
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
      cb(this, back);
    });

    // Fix (by Enter)
    this.keypress(ev => {
      if (ev.which === 13) {  // Enter
        this.blur();
      }
    });

    return this;
  };

  // Simplify Terms

  $('.term').each(function () {
    this.textContent = iso8601.prettify(this.textContent.trim(), moment().utcOffset());
  });

  // Fix and Unfix Event

  $('.fix-event').change(function () {
    let termID = this.getAttribute('term-id');

    if (this.checked) {
      schet.fix(termID).then(event => location.reload())
        .catch(err => location.reload());
    } else {
      schet.unfix(termID).then(event => location.reload())
        .catch(err => location.reload());
    }
  });

  // Edit Event Title
  if (!isFixed) {
    $('#title').editable((elem, back) => {
      let title = elem.text();
      schet.update({title}).then(event => {
        document.title = event.title;
        elem.text(event.title);
      }).catch(err => {
        alert(err);
        back();
      });
    });
  }

  // Edit Event Description

  autosize(document.getElementById('description'));

  if (!isFixed) {
    $('#description').focus(function () {
      let snapshot = this.value;

      // Cancel (by ESC)
      $(this).keydown(ev => {
        if (ev.which !== 27) {  // !== Esc
          return;
        }

        this.value = snapshot;
        this.blur();
      });

      // Fix (by Blur)
      $(this).blur(() => {
        let description = this.value;
        schet.update({description}).then(event => {
          this.value = event.description;
        }).catch(err => {
          alert(err);
        });
      });
    });
  }

  // Add Participant
  $('#add-participant').click(() => {
    let name = $('#participant-name').val();

    let schedule = {};
    $('.new-record').each(function () {
      let termID = this.getAttribute('term-id');
      schedule[termID] = this.value;
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
  if (!isFixed) {
    $('.participant-name').each(function () {
      let participantID = this.getAttribute('participant-id');
      $(this).editable((elem, back) => {
        let name = elem.text();
        schet.updateParticipant(participantID, {name}).then(event => {
          elem.text(event.participants[participantID]);
        }).catch(err => {
          alert(err);
          back();
        });
      });
    });
  }

  $('.delete-participant').click(function () {
    let participantID = this.getAttribute('participant-id');
    schet.deleteParticipant(participantID).then(() => location.reload())
      .catch(() => location.reload());
  });

  // Add Term
  $('#term-text').keypress(ev => {
    if (ev.which === 13) {  // Enter
      $('#add-term').click();
    }
  });

  $('#add-term').click(() => {
    let term;
    try {
      term = iso8601.normalize(
        $('#term-text').val(),
        moment().utcOffset()
      );
    } catch (e) {
      alert(e);
      return;
    }

    // Send to Server
    schet.addTerm(term).then(() => location.reload())
      .catch(err => {
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
  $('.delete-term').click(function () {
    let termID = this.getAttribute('term-id');
    schet.deleteTerm(termID).then(() => location.reload())
      .catch(() => location.reload());
  });

  // Edit Record
  $('.record').change(function () {
    let participantID = this.getAttribute('participant-id');
    let termID = this.getAttribute('term-id');

    schet.updateParticipant(participantID, {[termID]: this.value})
      .catch(() => location.reload());
  });

  // Add Comment
  $('#comment-form').submit(() => {
    let name = $('#comment-name').val();
    let body = $('#comment-body').val();

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
  $('.comment').each(function () {
    let commentID = this.getAttribute('comment-id');

    // Edit Comment Name
    $(this).find('.comment-name').editable((elem, back)=> {
      let name = elem.text();
      schet.updateComment(commentID, {name}).then(event => {
        elem.text(event.comments[commentID].name);
      }).catch(err => {
        alert(err);
        back();
      });
    });

    // Edit Comment Body
    $(this).find('.comment-body').editable((elem, back) => {
      let body = elem.text();
      schet.updateComment(commentID, {body}).then(event => {
        elem.text(event.comments[commentID].body);
      }).catch(err => {
        alert(err);
        back();
      });
    });

    // Delete Comment
    $(this).find('.delete-comment').click(() => {
      schet.deleteComment(commentID).then(() => location.reload())
        .catch(() => location.reload());
    });
  });
});
