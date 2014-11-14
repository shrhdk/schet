var Schet = function (eventID) {
    eventID = Number(eventID);

    if (isNaN(eventID) || eventID < 0) {
        throw new Error();
    }

    this.id = eventID;
};

Schet.errors = {
    ServerSideError: 'ServerSideError',
    InvalidParameterError: 'InvalidParameterError',
    NotFoundError: 'NotFoundError',
    FixedEventError: 'FixedEventError',
    TermNotFoundError: 'TermNotFoundError',
    ParticipantNotFoundError: 'ParticipantNotFoundError',
    CommentNotFoundError: 'CommentNotFoundError',
    DuplicatedTermError: 'DuplicatedTermError',
    DuplicatedParticipantError: 'DuplicatedParticipantError'
};

/**
 *
 * @param {!string} method
 * @param {string} path
 * @param {Object.<string,string>=} data
 */
Schet.prototype.req = function (method, path, data) {
    var path = path || '';
    var url = '/' + this.id + path;

    return new Promise(function (resolve, reject) {

        var xhr = new XMLHttpRequest();

        xhr.open(method, url);
        xhr.responseType = 'json';
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.addEventListener("load", function () {
            if (200 <= xhr.status && xhr.status <= 299) {
                resolve(xhr.response);
            } else {
                var error = new Error();
                error.status = xhr.status;
                error.name = xhr.response.error;
                reject(error);
            }
        });

        xhr.send(JSON.stringify(data));
    });
};

// Event

Schet.prototype.get = function () {
    return this.req('GET', '');
};

Schet.prototype.update = function (data) {
    return this.req('PUT', '', data);
};

Schet.prototype.fix = function (termID) {
    return this.req('PUT', '', {fixed: termID});
};

Schet.prototype.unfix = function () {
    return this.req('PUT', '', {fixed: ''});
};

Schet.prototype.delete = function () {
    return this.req('DELETE', '/' + self.id);
};

// Terms

Schet.prototype.addTerm = function (term) {
    return this.req('POST', '/terms', {term: term});
};

Schet.prototype.updateTerm = function (termID, term) {
    return this.req('PUT', '/terms/' + termID, {term: term});
};

Schet.prototype.deleteTerm = function (termID) {
    return this.req('DELETE', '/terms/' + termID);
};

// Participants

Schet.prototype.addParticipant = function (name, schedule) {
    schedule.name = name;
    return this.req('POST', '/participants', schedule);
};

Schet.prototype.updateParticipant = function (participantID, data) {
    return this.req('PUT', '/participants/' + participantID, data);
};

Schet.prototype.deleteParticipant = function (participantID) {
    return this.req('DELETE', '/participants/' + participantID);
};

// Comments

Schet.prototype.addComment = function (name, body) {
    return this.req('POST', '/comments', {name: name, body: body});
};

Schet.prototype.updateComment = function (commentID, data) {
    return this.req('PUT', '/comments/' + commentID, data);
};

Schet.prototype.deleteComment = function (commentID) {
    return this.req('DELETE', '/comments/' + commentID);
};
