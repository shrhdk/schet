var settings = require('../settings');

console.log('Starting Server...');

var app = require('../lib/app');

var server = app.listen(settings.app.port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
