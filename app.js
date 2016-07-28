"use strict"

var express = require('express');
var path = require('path');
var request = require('request');
var elasticsearch = require('elasticsearch');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var strategy = require('./setup-passport');
var esclient = new elasticsearch.Client({
  host: 'localhost:9200'
});

var index = require('./routes/index');
var auth = require('./routes/auth');

var app = express();

//  view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
// See express session docs for information on the options: https://github.com/expressjs/session
app.use(session({ secret: 'gLyB1w5pVQb2qnzdDRfCU0AFJyNBVxvO0hT6_2YSZ2AHydbnEa1ZtzLRnW71lZ7s', resave: false,  saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());


// routing
app.use('/', index);
app.use('/auth', auth);
app.get('/updatedata', function(req, res, next) {
  request.get({ url: 'https://fantasy.premierleague.com/drf/bootstrap-static', json: true}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      for (let i = 0; i<body.elements.length; i++) {
        esclient.index({
          index: 'myfpl',
          type: 'player',
          id: body.elements[i].id,
          body: body.elements[i]
        }, function(error, response) {
          // console.log(error);
          console.log('# '+ (i+1) + '. ' + body.elements[i].web_name + ' inserted!');
        });
      }
      res.send('Done!');
    } else {
      res.send('Try again!');
    }
  });
});

// Auth0 callback handler
app.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/url-if-something-fails' }),
  function(req, res) {
    if (!req.user) {
      throw new Error('user null');
    }
    res.redirect("/user");
  });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
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
