var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');
var mongoose = require('mongoose');
var Account = require('../models/Account');
var Player = require('../models/Player');
var Team = require('../models/Team');
var TransferOrder = require('../models/TransferOrder');

var FPL_URL = "https://fantasy.premierleague.com/drf";

router.all('/', function (req, res) {
    res.json({ message: 'Welcome to the My FPL API!' });
});

// Game data

router.get('/my-team', requireLogin, function (req, res) {
    Team.findOne({ event: req.app.locals.gw, username: req.session.user.username }, function (err, team) {
        res.json(team);
    });
});

router.get('/:id/teams', requireLogin, function (req, res) {
    Team.find({ username: req.params.id }).sort('event').exec(function (err, teams) {
        res.json(teams);
    });
});

router.get('/accounts', function (req, res) {
    Account.find().select('username name teamName').exec(function (err, accounts) {
        res.json(accounts);
    });
});

router.get('/standings', function (req, res) {
    Team.aggregate([
        {
            $group: {
                _id: '$username',
                totalPoints: { $sum: '$points' }
            }
        },
        {
            $sort: { 'totalPoints': -1 }
        }
    ], function (err, result) {
        res.json(result);
    });
});

router.get('/update-live-points', function (req, res) {
    request.get({ url: FPL_URL + '/elements', json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var elements = body;
            Team.find({ event: req.app.locals.event }).exec(function (err, teams) {
                teams.forEach(function (team) {
                    var totalPoints = 0;
                    team.players.forEach(function (player) {
                        totalPoints += elements[player].event_points;
                    }, this);
                    team.points = totalPoints;
                    team.save(function (err) {
                        console.log("Updated totalPoints for " + team.username + "'s team to " + team.points);
                    });
                }, this);
                res.send("Done!")
            });
        } else {
            throw error;
        }
    });
});

router.get('/update-all-points', function (req, res) {
    Team.find().exec(function (err, teams) {
        teams.forEach(function (team) {
            if (team.event === 0 || team.event > req.app.locals.event) return;
            var elements = JSON.parse(fs.readFileSync('public/data/event/'+team.event+'.json', 'utf8'));
            var totalPoints = 0;
            team.players.forEach(function (player) {
                totalPoints += elements.elements[player+1].stats.total_points;
            }, this);
            team.points = totalPoints;
            team.save(function (err) {
                console.log("Updated totalPoints for " + team.username + "'s team to " + team.points);
            });
        }, this);
        res.send("Done!")
    });
});

// Helper functions and middleware

function requireLogin(req, res, next) {
    if (!req.session.loggedIn) {
        res.redirect('/login?next=' + req.originalUrl);
    } else {
        next();
    }
};

module.exports = router;