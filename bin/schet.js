var settings = require('../settings');

console.log('Starting Server...');

var app = require('../lib/app');
app.listen(settings.app.port);
