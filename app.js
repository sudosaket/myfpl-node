"use strict"
var express = require('express');
var path = require('path');
var request = require('request');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var esGameUtils = require('./esGameUtils');

var app = express();

//  view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'baby doll xyz',
    resave: false,
    saveUninitialized: true
}));
app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

// set local variables
app.locals.gw = 0;

// routing
var index = require('./routes/index');
var transfers = require('./routes/transfers');
var standings = require('./routes/standings');
var auth = require('./routes/auth');
var data = require('./routes/data');
// var api = require('./routes/api');
app.use('/', index);
app.use('/', transfers);
app.use('/', standings);
app.use('/', auth);
app.use('/data', data);
// app.use('/api', api);

esGameUtils.initIndex().then(esGameUtils.initMapping);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.locals.pretty = true;
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// start server
app.listen(80, function () {
    console.log('App started!');
});
