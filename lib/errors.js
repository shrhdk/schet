var util = require('util');

/**
 * @constructor
 */
var SchetError = exports.SchetError = function (name) {
    'use strict';

    Error.call(this);
    this.name = name;
    this.json = {error: this.name};
};
util.inherits(SchetError, Error);

/**
 * @extends SchetError
 * @constructor
 */
var ServerSideError = exports.ServerSideError = function () {
    'use strict';

    SchetError.call(this, 'ServerSideError');
};
util.inherits(ServerSideError, SchetError);

/**
 * @extends SchetError
 * @constructor
 */
var InvalidParameterError = exports.InvalidParameterError = function () {
    'use strict';

    SchetError.call(this, 'InvalidParameterError');
};
util.inherits(InvalidParameterError, SchetError);

/**
 * @param {boolean=false} deleted
 * @extends SchetError
 * @constructor
 */
var NotFoundError = exports.NotFoundError = function (deleted) {
    'use strict';

    SchetError.call(this, 'NotFoundError');
    this.deleted = deleted || false;
};
util.inherits(NotFoundError, SchetError);

/**
 * @extends SchetError
 * @constructor
 */
var FixedEventError = exports.FixedEventError = function () {
    'use strict';

    SchetError.call(this, 'FixedEventError');
};
util.inherits(FixedEventError, SchetError);

/**
 * @param {boolean=false} deleted
 * @extends SchetError
 * @constructor
 */
var TermNotFoundError = exports.TermNotFoundError = function (deleted) {
    'use strict';

    SchetError.call(this, 'TermNotFoundError');
    this.deleted = deleted || false;
};
util.inherits(TermNotFoundError, SchetError);

/**
 * @param {boolean=false} deleted
 * @extends SchetError
 * @constructor
 */
var ParticipantNotFoundError = exports.ParticipantNotFoundError = function (deleted) {
    'use strict';

    SchetError.call(this, 'ParticipantNotFoundError');
    this.deleted = deleted || false;
};
util.inherits(ParticipantNotFoundError, SchetError);

/**
 * @param {boolean=false} deleted
 * @extends SchetError
 * @constructor
 */
var CommentNotFoundError = exports.CommentNotFoundError = function (deleted) {
    'use strict';

    SchetError.call(this, 'CommentNotFoundError');
    this.deleted = deleted || false;
};
util.inherits(ParticipantNotFoundError, SchetError);

/**
 * @extends SchetError
 * @constructor
 */
var DuplicatedTermError = exports.DuplicatedTermError = function () {
    'use strict';

    SchetError.call(this, 'DuplicatedTermError');
};
util.inherits(DuplicatedTermError, SchetError);

/**
 * @extends SchetError
 * @constructor
 */
var DuplicatedParticipantError = exports.DuplicatedParticipantError = function () {
    'use strict';

    SchetError.call(this, 'DuplicatedParticipantError');
};
util.inherits(DuplicatedParticipantError, SchetError);

/**
 * @extends SchetError
 * @constructor
 */
var UnsupportedOperationError = exports.UnsupportedOperationError = function () {
    'use strict';

    SchetError.call(this, 'UnsupportedOperationError');
};
util.inherits(UnsupportedOperationError, SchetError);
