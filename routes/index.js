var express = require('express');
var fs = require('fs');
var router = express.Router();

router.all('/', function(req, res, next) {
  fs.readFile('public/fpl_dynamic_data.json', 'utf8', function (err, data) {
    if (err) throw err;
    var body = JSON.parse(data);
    req.fixtures = body.next_event_fixtures;
    next();
  });
}, function (req, res, next) {
  fs.readFile('public/fpl_static_data.json', 'utf8', function (err, data) {
    if (err) throw err;
    var body = JSON.parse(data);
    req.teams = body.teams;
    next();
  });
}, function (req, res, next) {
  console.log(req.teams);
  res.render('index', { title: 'Home', currentRoute: 'index', fixtures: req.fixtures, teams: req.teams });
});

module.exports = router