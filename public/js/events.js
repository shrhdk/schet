window.addEventListener('load', function () {
    var eventID = location.pathname.substring(1);
    var schet = new Schet(eventID);

    // Date Format
    var dateFormat = 'YYYY/MM/DD HH:mm';
    var rangeSeparator = ' - ';

    // Localize and Simplify the Date and Time

    var isRange = function (dateString) {
        return dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z\/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$/)
            || dateString.match(/^\d{4}-\d{2}-\d{2}\/\d{4}-\d{2}-\d{2}$/);
    };

    var isDateOnly = function (dateString) {
        return dateString.match(/^\d{4}-\d{2}-\d{2}$/);
    };

    var simplifyDateRange = function (start, end) {
        var start = moment.utc(start);
        var end = moment.utc(end);

        var endStr = '';

        if (start.year() !== end.year()) {
            return start.format('YYYY/MM/DD') + ' - ' + end.format('YYYY/MM/DD');
        }

        return start.format('YYYY/MM/DD') + ' - ' + end.format('MM/DD');
    };

    var simplifyDateTimeRange = function (start, end, offset) {
        var start = moment.utc(start).add(offset, 'minutes');
        var end = moment.utc(end).add(offset, 'minutes');

        if (start.year() !== end.year()) {
            return start.format('YYYY/MM/DD HH:mm') + ' - ' + end.format('YYYY/MM/DD HH:mm');
        }

        if (start.month() !== end.month()) {
            return start.format('YYYY/MM/DD HH:mm') + ' - ' + end.format('MM/DD HH:mm');
        }

        if (start.date() !== end.date()) {
            return start.format('YYYY/MM/DD HH:mm') + ' - ' + end.format('MM/DD HH:mm');
        }

        return start.format('YYYY/MM/DD HH:mm') + ' - ' + end.format('HH:mm');
    };

    var simplify = function (dateString, offset) {
        if (!isRange(dateString)) {
            if (isDateOnly(dateString)) {
                return moment.utc(dateString).format('YYYY/MM/DD');
            } else {
                return moment.utc(dateString).format('YYYY/MM/DD HH:mm');
            }
        }

        var start = dateString.split('/')[0];
        var end = dateString.split('/')[1];

        if (isDateOnly(start)) {
            return simplifyDateRange(start, end);
        } else {
            return simplifyDateTimeRange(start, end, offset);
        }
    };

    [].forEach.call(document.querySelectorAll('.term'), function (term) {
        term.innerText = simplify(term.innerText.trim(), moment().utcOffset());
    });

    // Make Content Editable
    var makeContentEditable = function (element, multiline, cb) {
        var currentText = element.innerText;

        // Back function to use when error
        var back = function () {
            element.innerText = currentText;
            element.contentEditable = true;
            element.focus();
        };

        element.addEventListener('click', function () {
            element.contentEditable = true;
            element.focus();
        });

        element.addEventListener('blur', function () {
            element.contentEditable = false;
            cb(element.innerText, back);
        });

        // Cancel
        element.addEventListener('keydown', function (ev) {
            if (ev.which !== 27) {  // ! === Esc
                return;
            }

            element.innerText = currentText;
            element.contentEditable = false;
            element.blur();
        });

        if (!multiline) {
            element.addEventListener('keypress', function (ev) {
                if (ev.which === 13) {  // Enter
                    element.blur();
                }
            });
        }
    };

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

    var _fixEventCheckboxes = document.querySelectorAll('.fix-event-checkbox');
    [].forEach.call(_fixEventCheckboxes, function (_fixEventCheckbox) {
        _fixEventCheckbox.addEventListener('change', function () {
            var termID = _fixEventCheckbox.getAttribute('term-id');

            if (_fixEventCheckbox.checked) {
                schet.fix(termID).then(function (event) {
                    location.reload();
                }).catch(function (err) {
                    location.reload();
                });
            } else {
                schet.unfix(termID).then(function (event) {
                    location.reload();
                }).catch(function (err) {
                    location.reload();
                });
            }
        });
    });

    // Edit Event Title
    var _title = document.querySelector('#title');
    makeContentEditable(_title, false, function (text, back) {
        schet.update({title: text}).catch(function (err) {
            alert(err.message);
            back();
        });
    });

    // Edit Event Description
    var _description = document.querySelector('#description');
    makeContentEditable(_description, true, function (text) {
        schet.update({description: text}).catch(function (err) {
            alert(err.message);
            back();
        });
    });

    // Add Participant
    var _newParticipantButton = document.querySelector('#new-participant-button');
    if (_newParticipantButton) {
        _newParticipantButton.addEventListener('click', function () {
            var _newParticipantName = document.querySelector('#new-participant-name');
            var _newRecords = document.querySelectorAll('.new-record');

            // Construct Request Data
            var name = _newParticipantName.value;
            var schedule = {};
            [].forEach.call(_newRecords, function (_newRecord) {
                var termID = _newRecord.getAttribute('term-id');
                schedule[termID] = _newRecord.value;
            });

            schet.addParticipant(name, schedule).then(function (event) {
                location.reload();
            }).catch(function (err) {
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
    }

    // Edit Participant Name
    var _participantNames = document.querySelectorAll('.participant-name');
    [].forEach.call(_participantNames, function (_participantName) {
        var participantID = _participantName.getAttribute('participant-id');

        makeContentEditable(_participantName, false, function (text) {
            schet.updateParticipant(participantID, {name: text});
        });
    });

    // Delete Participant
    var _deleteParticipantButtons = document.querySelectorAll('.delete-participant');
    [].forEach.call(_deleteParticipantButtons, function (button) {
        var participantID = button.getAttribute('participant-id');
        button.addEventListener('click', function () {
            schet.deleteParticipant(participantID).then(function (event) {
                location.reload();
            }).catch(function (err) {
                location.reload();
            });
        });
    });

    // Add Term
    var _newTermButton = document.querySelector('#new-term-button');
    if (_newTermButton) {
        _newTermButton.addEventListener('click', function () {
            var _newTermField = document.querySelector('#new-term-field');
            var newTermString = _newTermField.value;

            if (newTermString == "") {
                return;
            }

            // Split Range
            var startDate = newTermString.split(rangeSeparator)[0];
            var endDate = newTermString.split(rangeSeparator)[1];

            // Parse String and Convert to Normal Format
            startDate = moment(startDate, dateFormat);
            endDate = moment(endDate, dateFormat);

            // Local Time to UTC Time
            startDate = startDate.utc();
            endDate = endDate.utc();

            // Convert Format
            startDate = startDate.format('YYYY-MM-DDTHH:mm[Z]');
            endDate = endDate.format('YYYY-MM-DDTHH:mm[Z]');
            var term = startDate + '/' + endDate;

            // Send to Server
            schet.addTerm(term).then(function (event) {
                location.reload();
            }).catch(function (err) {
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
    }

    // Delete Term
    var _deleteTermButtons = document.querySelectorAll('.delete-term');
    [].forEach.call(_deleteTermButtons, function (_button) {
        var termID = _button.getAttribute('term-id');
        _button.addEventListener('click', function () {
            schet.deleteTerm(termID).then(function (event) {
                location.reload();
            }).catch(function (err) {
                location.reload();
            });
        });
    });

    // Add Comment
    var _commentForm = document.querySelector('#comment-form');
    _commentForm.addEventListener('submit', function (ev) {
        var _commentNameField = document.querySelector('#comment-name-field');
        var _commentBodyField = document.querySelector('#comment-body-field');

        var name = _commentNameField.value;
        var body = _commentBodyField.value;

        schet.addComment(name, body).then(function (event) {
            location.reload();
        }).catch(function (err) {
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

        ev.preventDefault();
    });

    // Edit Comment Name
    var _commentNames = document.querySelectorAll('.comment-name');
    [].forEach.call(_commentNames, function (_commentName) {
        var commentID = _commentName.getAttribute('comment-id');

        makeContentEditable(_commentName, false, function (text, back) {
            schet.updateComment(commentID, {name: text}).catch(function (err) {
                alert(err.message);
                back();
            });
        });
    });

    // Edit Comment Body
    var _commentBodies = document.querySelectorAll('.comment-body');
    [].forEach.call(_commentBodies, function (_commentBody) {
        var commentID = _commentBody.getAttribute('comment-id');

        makeContentEditable(_commentBody, false, function (text, back) {
            schet.updateComment(commentID, {body: text}).catch(function (err) {
                alert(err.message);
                back();
            });
        });
    });

    // Delete Comment
    var _deleteCommentButtons = document.querySelectorAll('.delete-comment');
    [].forEach.call(_deleteCommentButtons, function (button) {
        var commentID = button.getAttribute('comment-id');
        button.addEventListener('click', function () {
            schet.deleteComment(commentID).then(function (event) {
                location.reload();
            }).catch(function (err) {
                location.reload();
            });
        });
    });
});
