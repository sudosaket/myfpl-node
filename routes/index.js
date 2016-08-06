var express = require('express');
var fs = require('fs');
var router = express.Router();
var moment = require('moment-timezone');
var elasticsearch = require('elasticsearch');
var es = new elasticsearch.Client({
    host: 'localhost:9200'
});

router.all('/', function (req, res, next) {
    fs.readFile('public/fplDynamicData.json', 'utf8', function (err, data) {
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
    fs.readFile('public/fplStaticData.json', 'utf8', function (err, data) {
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
            id: req.session.user.username + "_" + req.app.locals.gw
        }, function (error, response) {
            if (response.found) {
                req.myTeam = response._source;
            }
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
        myTeam: req.myTeam,
        players: req.players
    });
});

module.exports = router