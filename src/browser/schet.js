'use strict';

export class Schet {
  constructor(eventID) {
    this.eventID = eventID;
  }

  /**
   *
   * @param {!string} method
   * @param {string} path
   * @param {Object.<string,string>=} data
   */
  req(method = 'GET', path = '', data = {}) {
    const url = '/' + this.eventID + path;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open(method, url);
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Content-Type', 'application/json');

      xhr.addEventListener('load', () => {
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
  }

  // Event

  get() {
    return this.req('GET', '');
  }

  update(data) {
    return this.req('PUT', '', data);
  }

  fix(termID) {
    return this.req('PUT', '', {fixed: termID});
  }

  unfix() {
    return this.req('PUT', '', {fixed: ''});
  }

  delete() {
    return this.req('DELETE', '/' + self.id);
  }

  // Terms

  addTerm(term) {
    return this.req('POST', '/terms', {term: term});
  }

  updateTerm(termID, term) {
    return this.req('PUT', '/terms/' + termID, {term: term});
  }

  deleteTerm(termID) {
    return this.req('DELETE', '/terms/' + termID);
  }

  // Participants

  addParticipant(name, schedule) {
    schedule.name = name;
    return this.req('POST', '/participants', schedule);
  }

  updateParticipant(participantID, data) {
    return this.req('PUT', '/participants/' + participantID, data);
  }

  deleteParticipant(participantID) {
    return this.req('DELETE', '/participants/' + participantID);
  }

  // Comments

  addComment(name, body) {
    return this.req('POST', '/comments', {name: name, body: body});
  }

  updateComment(commentID, data) {
    return this.req('PUT', '/comments/' + commentID, data);
  }

  deleteComment(commentID) {
    return this.req('DELETE', '/comments/' + commentID);
  }
}
