var express = require('express');
var fs = require('fs');
var router = express.Router();
var moment = require('moment-timezone');
var elasticsearch = require('elasticsearch');
var es = new elasticsearch.Client({
    host: 'localhost:9200'
});

router.get('/transfers', function (req, res, next) {
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
    if (req.session.loggedIn !== true) {
        res.redirect('/login?next=transfers');
    } else {
        es.get({
            index: "game",
            type: "team",
            id: req.session.user.username + "_" + (req.app.locals.gw + 1)
        }, function (error, response) {
            if (response.found) {
                req.myTeam = response._source;
            }
            next();
        });
    }
}, function (req, res, next) {
    res.render('transfers', {
        title: "Transfers",
        currentRoute: "transfers",
        players: req.players,
        teams: req.teams,
        myTeam: req.myTeam,
        transferLimit: req.session.user.transfer_limit,
        transferTurn: req.session.user.transfer_turn,
        fixtures: req.fixtures
    });
});

router.post('/transfers', function (req, res, next) {
    if (req.session.loggedIn !== true) {
        res.redirect('/login?next=transfers');
    } else {
        next();
    }
}, function (req, res, next) {
    var playerIn = +req.body.playerIn;
    var playerOut = (req.body.playerOut != undefined) ? +req.body.playerOut : -1;
    var gw = req.app.locals.gw;
    es.update({
        index: "game",
        type: "team",
        id: req.session.user.username + "_" + gw,
        body: {
            script: "ctx._source.transfers += transfer",
            params: {
                transfer: {
                    in: playerIn,
                    out: playerOut
                }
            },
            upsert: {
                account: req.session.user.username,
                gw: gw,
                transfers: [{
                    in: playerIn,
                    out: playerOut
                }],
                players: []
            }
        }
    }, function (error, response) {
        if (error) throw error;
        next();
    });
}, function (req, res, next) {
    es.get({
        index: "game",
        type: "team",
        id: req.session.user.username + "_" + req.app.locals.gw
    }, function (error, response) {
        if (error) throw error;
        req.previousPlayers = response._source.players;
        next();
    });
}, function (req, res, err) {
    var previousPlayers = req.previousPlayers;
    var playerIn = +req.body.playerIn;
    var playerOut = (req.body.playerOut != undefined) ? +req.body.playerOut : -1;
    if (playerOut < 0) {
        previousPlayers.push({ id: playerIn, score: 0 });
        for (var i = 0; i < previousPlayers.length; i++) {
            previousPlayers[i].score = 0;
        }
    } else {
        for (var i = 0; i < previousPlayers.length; i++) {
            if (playerOut === previousPlayers[i].id) {
                previousPlayers[i].id = playerIn;
            }
            previousPlayers[i].score = 0;
        }
    }
    var gw = req.app.locals.gw;
    es.update({
        index: "game",
        type: "team",
        id: req.session.user.username + "_" + (gw + 1),
        body: {
            script: "ctx._source.players += player",
            params: {
                player: {
                    id: playerIn,
                    score: 0
                }
            },
            upsert: {
                account: req.session.user.username,
                gw: (gw + 1),
                players: previousPlayers,
                transfers: []
            }
        }
    }, function (error, response) {
        if (error) throw error;
        res.redirect('transfers');
    });
});

module.exports = router;