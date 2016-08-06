var express = require('express');
var fs = require('fs');
var router = express.Router();
var moment = require('moment-timezone');
var elasticsearch = require('elasticsearch');
var es = new elasticsearch.Client({
    host: 'localhost:9200'
});

router.get('/standings', function (req, res, next) {
    if (req.session.loggedIn !== true) {
        res.redirect('/login?next=standings');
    } else {
        es.search({
            index: "game",
            type: "team"
        }, function (error, response) {
            if (error) throw error;
            var data = new Map();
            response.hits.hits.forEach(function (element) {
                var account = element._source.account;
                var totalScore = 0;
                element._source.players.forEach(function (player) {
                    totalScore += player.score;
                }, this);
                if (data.has(account)) {
                    data.set(account, data.get(account)+totalScore);
                } else {
                    data.set(account, totalScore);
                }
            }, this);
            req.teams = data;
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
        if (error) throw error;
        res.render('standings', { title: 'Standings', currentRoute: 'standings', teams: req.teams, accounts: response.hits.hits });
    });
});

module.exports = router