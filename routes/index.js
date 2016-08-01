var express = require('express');
var fs = require('fs');
var router = express.Router();
var moment = require('moment-timezone');
var elasticsearch = require('elasticsearch');
var es = new elasticsearch.Client({
  host: 'localhost:9200'
});

router.all('/', function (req, res, next) {
  fs.readFile('public/fpl_dynamic_data.json', 'utf8', function (err, data) {
    if (err) throw err;
    var body = JSON.parse(data);
    req.fixtures = body.next_event_fixtures;
    for (var i = 0; i < req.fixtures.length; i++) {
      req.fixtures[i].kickoff_time = moment.tz(new Date(req.fixtures[i].kickoff_time), "Asia/Kolkata").format();
      req.fixtures[i].kickoff_time_formatted = moment.tz(new Date(req.fixtures[i].kickoff_time), "Asia/Kolkata").format("D MMM HH:mm");
    }
    next();
  });
}, function (req, res, next) {
  fs.readFile('public/fpl_static_data.json', 'utf8', function (err, data) {
    if (err) throw err;
    var body = JSON.parse(data);
    req.teams = body.teams;
    req.players = body.elements;
    next();
  });
}, function (req, res, next) {
  if (req.session.loggedIn) {
    es.get({
      index: "game",
      type: "team",
      id: req.session.user.username + "_" + req.app.locals.gw,
    }, function (error, response) {
      req.my_team = response._source;
      next();
    });
  } else {
    next();
  }
}, function (req, res, next) {
  res.render('index', {
    title: 'Home',
    currentRoute: 'index',
    fixtures: req.fixtures,
    teams: req.teams,
    my_team: req.my_team,
    players: req.players
  });
});

router.get('/standings', function (req, res, next) {
  if (req.session.loggedIn !== true) {
    res.redirect('/login?next=standings');
  } else {
    es.search({
      index: "game",
      type: "team",
      body: {
        filter: {
          term: {
            gw: req.app.locals.gw
          }
        },
        sort: { "score_upto_now": { order: "desc" } }
      }
    }, function (error, response) {
      req.teams = response.hits.hits;
      next();
    });
  }
}, function (req, res, next) {
  es.search({
    index: "game",
    type: "account",
    body: {
      _source: ["name", "username", "team_name"]
    }
  }, function (error, response) {
    res.render('standings', { title: 'Standings', currentRoute: 'standings', teams: req.teams, accounts: response.hits.hits });
  });
});

module.exports = router