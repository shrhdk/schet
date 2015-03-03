'use strict';

var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var settings = require('./settings');

var app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride((req, res) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    const method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

// Static Files
app.use(express.static(path.join(__dirname, './public')));

// Router
app.use('/', require('./routes/events'));
app.use('/', require('./routes/terms'));
app.use('/', require('./routes/participants'));
app.use('/', require('./routes/comments'));

// Start
console.log('Starting Server...');
var server = app.listen(settings.app.port, () => {
  let host = server.address().address;
  let port = server.address().port;

  console.log('Schet listening at http://%s:%s', host, port);
});
