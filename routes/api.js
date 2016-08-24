var express = require('express');
var router = express.Router();
var request = require('request');
var mongoose = require('mongoose');
var Account = require('../models/Account');
var Player = require('../models/Player');
var Team = require('../models/Team');
var TransferOrder = require('../models/TransferOrder');

var FPL_URL = "https://fantasy.premierleague.com/drf";

router.all('/', function (req, res) {
    res.send('Welcome to the My FPL API!');
});

// FPL data endpoints

router.get('/bootstrap-static', function (req, res) {
    request.get({ url: FPL_URL + '/bootstrap-static', json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.json(body);
        } else {
            throw error;
        }
    });
});

router.get('/bootstrap-dynamic', function (req, res) {
    request.get({ url: FPL_URL + '/bootstrap-dynamic', json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.json(body);
        } else {
            throw error;
        }
    });
});

router.get('/elements', function (req, res) {
    request.get({ url: FPL_URL + '/elements', json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.json(body);
        } else {
            throw error;
        }
    });
});

router.get('/fixtures', function (req, res) {
    var query = (req.query.event) ? '?event=' + req.query.event : '';
    request.get({ url: FPL_URL + '/fixtures/' + query, json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.json(body);
        } else {
            throw error;
        }
    });
});

router.get('/element-summary/:id', function (req, res) {
    request.get({ url: FPL_URL + '/element-summary/' + req.params.id, json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.json(body);
        } else {
            throw error;
        }
    });
});

router.get('/event/:id/live', function (req, res) {
    request.get({ url: FPL_URL + '/event/' + req.params.id + '/live', json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.json(body);
        } else {
            throw error;
        }
    });
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
                    team.save(function(err) {
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
    request.get({ url: FPL_URL + '/elements', json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var elements = body;
            Team.find().exec(function (err, teams) {
                teams.forEach(function (team) {
                    var totalPoints = 0;
                    team.players.forEach(function (player) {
                        totalPoints += elements[player].event_points;
                    }, this);
                    team.points = totalPoints;
                    team.save(function(err) {
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

// Helper functions and middleware

function requireLogin(req, res, next) {
    if (!req.session.loggedIn) {
        res.redirect('/login?next=' + req.originalUrl);
    } else {
        next();
    }
};

module.exports = router;