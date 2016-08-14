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
    es.search({
        index: "game",
        type: "player"
    }, function (error, response) {
        response.hits.hits.forEach(function (element) {
            if (!element._source.is_available) {
                req.players[element._id].is_available = false;
            }
        }, this);
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
    es.get({
        index: "game",
        type: "account",
        id: req.session.user.username
    }, function (error, response) {
        req.session.user.transfer_limit = response._source.transfer_limit;
        req.session.user.transfer_turn = response._source.transfer_turn;
        next();
    });
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
        id: req.session.user.username + "_" + (req.app.locals.gw + 1)
    }, function (error, response) {
        if (response.found) req.currentPlayers = response._source.players; else req.currentPlayers = [];
        next();
    });
}, function (req, res, next) {
    var currentPlayers = req.currentPlayers;
    var playerIn = +req.body.playerIn;
    var playerOut = (req.body.playerOut != undefined) ? +req.body.playerOut : -1;
    if (playerOut < 0) {
        currentPlayers.push({ id: playerIn, score: 0 });
    } else {
        for (var i = 0; i < currentPlayers.length; i++) {
            if (playerOut === currentPlayers[i].id) {
                currentPlayers[i].id = playerIn;
            }
        }
    }
    var gw = req.app.locals.gw;
    es.update({
        index: "game",
        type: "team",
        id: req.session.user.username + "_" + (gw + 1),
        body: {
            doc: {
                players: currentPlayers
            },
            upsert: {
                account: req.session.user.username,
                gw: (gw + 1),
                players: currentPlayers,
                transfers: []
            }
        }
    }, function (error, response) {
        if (error) throw error;
        next();
    });
}, function (req, res, next) {
    es.index({
        index: "game",
        type: "player",
        id: +req.body.playerIn,
        body: {
            is_available: false
        }
    }, function (error, response) {
        next();
    });
}, function (req, res, next) {
    if (req.body.playerOut != undefined) {
        es.index({
            index: "game",
            type: "player",
            id: +req.body.playerOut,
            body: {
                is_available: true
            }
        }, function (error, response) {
            next();
        });
    } else {
        next();
    }
}, function (req, res, next) {
    es.update({
        index: "game",
        type: "account",
        id: req.session.user.username,
        body: {
            script: "ctx._source.transfer_limit -= 1; ctx._source.transfer_turn = false"
        }
    }, function (error, response) {
        if (error) throw error;
        es.get({
            index: "game",
            type: "transfer_order",
            id: req.session.user.username
        }, function (error, response) {
            req.next_user = response._source.next;
            next();
        });
    });
}, function (req, res, next) {
    es.get({
        index: "game",
        type: "transfer_order",
        id: req.next_user
    }, function (error, response) {
        if (response._source.started) {
            es.update({
                index: "game",
                type: "transfer_order",
                id: req.next_user,
                body: {
                    script: "ctx._source.started = false"
                }
            });
            es.update({
                index: "game",
                type: "account",
                id: response._source.next,
                body: {
                    script: "ctx._source.transfer_turn = true"
                }
            });
            es.update({
                index: "game",
                type: "transfer_order",
                id: response._source.next,
                body: {
                    script: "ctx._source.started = true"
                }
            }, function (error, response) {
                req.session.user.transfer_limit -= 1;
                req.session.user.transfer_turn = false;
                res.redirect('transfers');
            });
        } else {
            es.update({
                index: "game",
                type: "account",
                id: req.next_user,
                body: {
                    script: "ctx._source.transfer_turn = true"
                }
            }, function (error, response) {
                req.session.user.transfer_limit -= 1;
                req.session.user.transfer_turn = false;
                res.redirect('transfers');
            });
        }
    })
});

module.exports = router;