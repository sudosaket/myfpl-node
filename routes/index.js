var express = require('express');
var fs = require('fs');
var router = express.Router();
var moment = require('moment-timezone');
var fplUtils = require('../fplUtils');
var mongoose = require('mongoose');
var Team = require('../models/Team');

router.get('/', function (req, res, next) {
    fs.readFile('public/data/bootstrap-static.json', 'utf8', function (err, data) {
        if (err) throw err;
        var body = JSON.parse(data);
        req.teams = body.teams;
        req.elements = body.elements;
        req.elementTypes = body.element_types;
        next();
    });
}, function (req, res, next) {
    fs.readFile('public/data/event/' + req.app.locals.event + '.json', 'utf8', function (err, data) {
        if (err) throw err;
        var body = JSON.parse(data);
        req.fixtures = body.fixtures;
        for (var i = 0; i < req.fixtures.length; i++) {
            req.fixtures[i].kickoff_time = moment.tz(new Date(req.fixtures[i].kickoff_time), "Asia/Kolkata").format();
            req.fixtures[i].kickoff_time_formatted = moment.tz(new Date(req.fixtures[i].kickoff_time), "Asia/Kolkata").format("D MMM HH:mm");
        }
        next();
    });
}, function (req, res, next) {
    if (req.session.loggedIn) {
        Team.findOne({ username: req.session.user.username, event: req.app.locals.event }, function (err, team) {
            req.myTeam = team;
            next();
        });
    } else {
        next();
    }
}, function (req, res, next) {
    res.render('index', {
        title: 'Home',
        currentRoute: 'index',
        teams: req.teams,
        elements: req.elements,
        elementTypes: req.elementTypes,
        fixtures: req.fixtures,
        myTeam: req.myTeam
    });
});

module.exports = router