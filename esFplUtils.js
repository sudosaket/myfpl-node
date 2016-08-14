"use strict"
var request = require('request');
var fs = require('fs');
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    host: 'localhost:9200'
});

function getStaticDataFromFpl(req, res, callback) {
    request.get({ url: 'https://fantasy.premierleague.com/drf/bootstrap-static', json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            fs.writeFile('public/fplStaticData.json', JSON.stringify(body, null, 4), function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("New static data saved!");
                callback(req, res);
            });
        } else {
            throw error;
        }
    });
}
exports.getStaticDataFromFpl = getStaticDataFromFpl;

function getDynamicDataFromFpl(req, res, callback) {
    request.get({ url: 'https://fantasy.premierleague.com/drf/bootstrap-dynamic', json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            fs.writeFile('public/fplDynamicData.json', JSON.stringify(body, null, 4), function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("New dynamic data saved!");
                callback(req, res);
            });
        } else {
            throw error;
        }
    });
}
exports.getDynamicDataFromFpl = getDynamicDataFromFpl;

function getFixturesDataFromFpl(req, res, callback) {
    request.get({ url: 'https://fantasy.premierleague.com/drf/event/' + req.app.locals.gw + '/live', json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            fs.writeFile('public/fplCurrentFixtures.json', JSON.stringify(body, null, 2), function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("New fixture data saved!");
                callback(req, res);
            });
        } else {
            throw error;
        }
    });
}
exports.getFixturesDataFromFpl = getFixturesDataFromFpl;

function updatePlayerData(req, res, callback) {
    fs.readFile('fplStaticData.json', 'utf8', function (err, data) {
        if (err) throw err;
        var body = JSON.parse(data);
        var counter = 0;
        for (let i = 0; i < body.elements.length; i++) {
            client.index({
                index: 'myfpl',
                type: 'player',
                id: body.elements[i].id,
                body: body.elements[i]
            }, function (error, response) {
                console.log('# ' + (i + 1) + '. ' + body.elements[i].web_name + ' inserted!');
                counter++;
                if (counter == body.elements.length) {
                    callback(req, res);
                }
            });
        }
    });
}
exports.updatePlayerData = updatePlayerData;

function updateTeamData(req, res, callback) {
    fs.readFile('fplStaticData.json', 'utf8', function (err, data) {
        if (err) throw err;
        var body = JSON.parse(data);
        var counter = 0;
        for (let i = 0; i < body.teams.length; i++) {
            client.index({
                index: 'myfpl',
                type: 'team',
                id: body.teams[i].id,
                body: body.teams[i]
            }, function (error, response) {
                console.log('# ' + (i + 1) + '. ' + body.teams[i].name + ' updated!');
                counter++;
                if (counter == body.teams.length) {
                    callback(req, res);
                }
            });
        }
    });
}
exports.updateTeamData = updateTeamData;

function addPlayerTypesData(req, res, callback) {
    fs.readFile('fplStaticData.json', 'utf8', function (err, data) {
        if (err) throw err;
        var body = JSON.parse(data);
        var counter = 0;
        for (let i = 0; i < body.element_types.length; i++) {
            client.index({
                index: 'myfpl',
                type: 'player_type',
                id: body.element_types[i].id,
                body: body.element_types[i]
            }, function (error, response) {
                console.log('# ' + (i + 1) + '. Player type ' + body.element_types[i].singular_name + ' added!');
                counter++;
                if (counter == body.element_types.length) {
                    callback(req, res);
                }
            });
        }
    });
}
exports.addPlayerTypesData = addPlayerTypesData;

function updateGamesweekData(req, res, callback) {
    fs.readFile('fplStaticData.json', 'utf8', function (err, data) {
        if (err) throw err;
        var body = JSON.parse(data);
        var counter = 0;
        for (let i = 0; i < body.events.length; i++) {
            client.index({
                index: 'myfpl',
                type: 'gamesweek',
                id: body.events[i].id,
                body: body.events[i]
            }, function (error, response) {
                console.log('# ' + (i + 1) + '. ' + body.events[i].name + ' updated!');
                counter++;
                if (counter == body.events.length) {
                    callback(req, res);
                }
            });
        }
    });
}
exports.updateGamesweekData = updateGamesweekData;