var express = require('express');
var router = express.Router();
var esFplUtils = require('../esFplUtils');
var esGameUtils = require('../esGameUtils');
var fs = require('fs');
var elasticsearch = require('elasticsearch');
var es = new elasticsearch.Client({
    host: 'localhost:9200'
});

router.get('/get-static', function (req, res) {
    esFplUtils.getStaticDataFromFpl(req, res, function (req, res) {
        res.send('Static data loaded!');
    });
});

router.get('/get-dynamic', function (req, res) {
    esFplUtils.getDynamicDataFromFpl(req, res, function (req, res) {
        res.send('Dynamic data loaded!');
    });
});

router.get('/get-current-fixtures', function (req, res) {
    esFplUtils.getFixturesDataFromFpl(req, res, function (req, res) {
        res.send('Fixture data loaded!');
    });
});

router.get('/advance-gamesweek', function (req, res) {
    esGameUtils.advanceGamesweek(req, res, function (req, res) {
        res.send('Gamesweek advanced!');
    });
});

router.get('/init-transfer-order', function (req, res) {
    esGameUtils.initTransferOrder(req, res, function (req, res) {
        res.send('Transfer order set!');
    });
});

router.get('/set-transfer-turn/:username', function (req, res) {
    es.update({
        index: "game",
        type: "account",
        id: req.params.username,
        body: {
            doc: {
                transfer_turn: true
            }
        }
    }, function (error, response) {
        if (error) {
            res.send('Username not found!');
        } else {
            res.send('Transfer turn set to true for ' + req.params.username);
        }
    });
});

router.get('/update-scores', function (req, res, next){
    fs.readFile('public/fplStaticData.json', 'utf8', function (err, data) {
        if (err) throw err;
        req.fplbody = JSON.parse(data);
        next();
    });
}, function (req, res, next) {
    es.search({
        index: "game",
        type: "account",
        body: {
            _source: ["username"]
        }
    }, function (error, response) {
        if (error) throw error;
        req.accounts = response.hits.hits;
        next();
    });
}, function (req, res, next) {
    req.accounts.forEach(function(account) {
        es.get({
            index: "game",
            type: "team",
            id: account._source.username + "_" + (req.app.locals.gw)
        }, function (error, response) {
            if (response.found) {
                var players = response._source.players
                players.forEach(function (element) {
                    element.score = req.fplbody.elements[element.id].event_points;
                }, this);
                es.update({
                    index: "game",
                    type: "team",
                    id: account._source.username + "_" + (req.app.locals.gw),
                    body: {
                        doc: {
                            players: players
                        }
                    }
                }, function (error, response) {
                    console.log('Updated!');
                });
            }
        });
    }, this);
    res.send('Updated!');
});

router.get('/update-scores/:username', function (req, res, next) {
    fs.readFile('public/fplStaticData.json', 'utf8', function (err, data) {
        if (err) throw err;
        var body = JSON.parse(data);
        es.get({
            index: "game",
            type: "team",
            id: req.params.username + "_" + (req.app.locals.gw)
        }, function (error, response) {
            if (response.found) {
                var players = response._source.players
                players.forEach(function (element) {
                    element.score = body.elements[element.id].event_points;
                }, this);
                es.update({
                    index: "game",
                    type: "team",
                    id: req.params.username + "_" + (req.app.locals.gw),
                    body: {
                        doc: {
                            players: players
                        }
                    }
                }, function (error, response) {
                    res.send("Points updated for " + req.params.username + "!");
                });
            }
        });
    });
});

module.exports = router;