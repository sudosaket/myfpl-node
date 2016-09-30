"use strict"
var express = require('express');
var router = express.Router();
var fs = require('fs');
var mongoose = require('mongoose');
var Team = require('../models/Team');
var Account = require('../models/Account');

router.get('/history/:username?', function (req, res, next) {
    if (!req.session.loggedIn) {
        res.redirect('/login?next=' + req.originalUrl);
    } else {
        next();
    }
}, (req, res, next) => {
    fs.readFile('public/data/bootstrap-static.json', 'utf8', (err, data) => {
        if (err) throw err;
        var body = JSON.parse(data);
        req.teams = body.teams;
        req.elements = body.elements;
        req.elementTypes = body.element_types;
        next();
    });
}, (req, res, next) => {
    var scores = [];
    var done = 0;
    for (let i = 1; i <= req.app.locals.event; i++) {
        fs.readFile('public/data/event/' + i + '.json', 'utf8', (err, data) => {
            if (err) throw err;
            var body = JSON.parse(data);
            done += 1;
            scores[i-1] = body;
            if (done === req.app.locals.event) {
                req.scores = scores;
                next();
            }
        });
    }
}, (req, res, next) => {
    var username = (req.params.username) ? req.params.username : req.session.user.username;
    Account.findOne({ username: username }, (err, account) => {
        if (account) {
            req.account = account.name;
        } else {
            req.account = req.session.user.name;
            username = req.session.user.username;
        }
        Team.find({ username: username }, {}, { sort: { event: 1 } }, (err, teams) => {
            var history = [];
            teams.shift();
            teams.every(function(team, index) {
                if (index === req.app.locals.event) {
                    return false;
                } else {
                    history.push(team);
                    return true;
                }
            });
            res.render('history', {
                title: 'History',
                currentRoute: 'history',
                history: history.reverse(),
                account: req.account,
                teams: req.teams,
                elements: req.elements,
                elementTypes: req.elementTypes,
                scores: req.scores
            });
        });
    });
});

module.exports = router;