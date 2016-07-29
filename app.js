"use strict"

var express = require('express');
var path = require('path');
var request = require('request');
var cookieParser = require('cookie-parser');

// elasticsearch setup
var elasticsearch = require('elasticsearch');
var esclient = new elasticsearch.Client({
    host: 'localhost:9200'
});

var app = express();

//  view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// routing
var index = require('./routes/index');
var auth = require('./routes/auth');
var es = require('./routes/es');
app.use('/', index);
app.use('/auth', auth);
app.use('/es', es);

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
app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
