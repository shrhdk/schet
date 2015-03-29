'use strict';

var $ = require('jquery');
var autosize = require('autosize');
var moment = require('moment');

$.fn.editable = require('./editable');
var ERRORS = require('../errors');
var Schet = require('./schet').Schet;
var iso8601 = require('../util/iso8601');

$(() => {
  let eventID = location.pathname.substring(1);
  let schet = new Schet(eventID);
  let isFixed = $('.fix-event[checked=checked]').size();

  // Simplify Terms

  $('.term').each(function () {
    this.textContent = iso8601.prettify(this.textContent.trim(), moment().utcOffset());
  });

  // auto size textarea

  autosize(document.getElementById('description'));

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

  // Add Comment
  $('#comment-form').submit(() => {
    let name = $('#comment-name').val();
    let body = $('#comment-body').val();

    schet.addComment(name, body).then(() => location.reload())
      .catch(err => {
        switch (err.status) {
          case 400:
            return alert('Bad Comment');
        }
        location.reload();
      });

    return false;
  });

  // Edit Comment Name
  $('.comment').each(function () {
    let commentID = this.getAttribute('comment-id');

    // Edit Comment Name
    $(this).find('.comment-name').editable((elem, fallback)=> {
      let name = elem.text();
      schet.updateComment(commentID, {name}).then(event => {
        elem.text(event.comments[commentID].name);
      }).catch(err => {
        switch (err.status) {
          case 400:
            alert('Bad Comment');
            return fallback();
        }
        location.reload();
      });
    });

    // Edit Comment Body
    $(this).find('.comment-body').editable((elem, fallback) => {
      let body = elem.text();
      schet.updateComment(commentID, {body}).then(event => {
        elem.text(event.comments[commentID].body);
      }).catch(err => {
        switch (err.status) {
          case 400:
            alert('Bad Comment');
            return fallback();
        }
      });
    });

    // Delete Comment
    $(this).find('.delete-comment').click(() => {
      schet.deleteComment(commentID).then(() => location.reload())
        .catch(() => location.reload());
    });
  });

  // The following code make page modifiable.
  // So, skip the followings when the event is fixed.
  if (isFixed) {
    return;
  }

  // Edit Event Title
  $('#title').editable((elem, fallback) => {
    let title = elem.text();
    schet.update({title}).then(event => {
      document.title = event.title;
      elem.text(event.title);
    }).catch(err => {
      switch (err.status) {
        case 400:
          alert('Bad Title.');
          return fallback();
        case 409:
          alert('Event is already fixed.');
          break;
      }
      location.reload();
    });
  });

  // Edit Event Description

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

        // Update Textarea Size
        let evt = document.createEvent('Event');
        evt.initEvent('autosize.update', true, false);
        this.dispatchEvent(evt);
      }).catch(err => {
        switch (err.status) {
          case 409:
            alert('Event is already fixed.');
            break;
        }
        location.reload();
      });
    });
  });

  // Add Participant
  $('#add-participant').click(() => {
    let name = $('#participant-name').val();

    let schedule = {};
    $('.new-record').each(function () {
      let termID = this.getAttribute('term-id');
      schedule[termID] = this.value;
    });

    schet.addParticipant(name, schedule).then(() => location.reload())
      .catch(err => {
        switch (err.status) {
          case 400:
            return alert('Bad Name.');
          case 409:
            return alert('Duplicated Name');
        }
        location.reload();
      });
  });

  // Edit Participant Name
  $('.participant-name').each(function () {
    let participantID = this.getAttribute('participant-id');
    $(this).editable((elem, fallback) => {
      let name = elem.text();
      schet.updateParticipant(participantID, {name}).then(event => {
        elem.text(event.participants[participantID]);
      }).catch(err => {
        switch (err.status) {
          case 400:
            alert('Bad Name.');
            return fallback();
          case 409:
            alert('Duplicated Name');
            return fallback();
        }
        location.reload();
      });
    });
  });

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
        switch (err.status) {
          case 400:
            return alert('Bad Term Format.');
          case 409:
            return alert('Duplicated Term');
        }
        location.reload();
      });
  });

  // Delete Term
  $('.delete-term').click(function () {
    let termID = this.getAttribute('term-id');
    schet.deleteTerm(termID).then(() => location.reload())
      .catch(err => {
        switch (err.status) {
          case 409:
            alert('Event is already fixed.');
            break;
        }
        location.reload();
      });
  });

  // Edit Record
  $('.record').change(function () {
    let participantID = this.getAttribute('participant-id');
    let termID = this.getAttribute('term-id');

    schet.updateParticipant(participantID, {[termID]: this.value})
      .catch(err => {
        switch (err.status) {
          case 409:
            alert('Event is already fixed.');
            break;
        }
        location.reload();
      });
  });
});
