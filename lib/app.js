var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

// Static Files
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../public/lib/jquery')));
app.use(express.static(path.join(__dirname, '../public/lib/bootstrap')));
app.use(express.static(path.join(__dirname, '../public/lib/bootstrap-daterangepicker')));
app.use(express.static(path.join(__dirname, '../public/lib/moment')));

// Router
app.use('/', require('./routes/events'));
app.use('/', require('./routes/terms'));
app.use('/', require('./routes/participants'));
app.use('/', require('./routes/comments'));

module.exports = app;
