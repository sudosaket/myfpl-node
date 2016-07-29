"use strict"
var request = require('request');
var fs = require('fs');

// elasticsearch setup
var elasticsearch = require('elasticsearch');
var es_client = new elasticsearch.Client({
    host: 'localhost:9200'
});

function get_data_from_fpl(req, res, callback) {
    request.get({ url: 'https://fantasy.premierleague.com/drf/bootstrap-static', json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            fs.writeFile('fpl_data.json', JSON.stringify(body, null, 4), function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("New data saved!");
                callback(req, res);
            });
        } else {
            throw error;
        }
    });
}

function update_player_data(req, res, callback) {
    fs.readFile('fpl_data.json', 'utf8', function (err, data) {
        if (err) throw err;
        var body = JSON.parse(data);
        var counter = 0;
        for (let i = 0; i < body.elements.length; i++) {
            es_client.index({
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

function update_team_data(req, res, callback) {
    fs.readFile('fpl_data.json', 'utf8', function (err, data) {
        if (err) throw err;
        var body = JSON.parse(data);
        var counter = 0;
        for (let i = 0; i < body.teams.length; i++) {
            es_client.index({
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

function add_player_types_data(req, res, callback) {
    fs.readFile('fpl_data.json', 'utf8', function (err, data) {
        if (err) throw err;
        var body = JSON.parse(data);
        var counter = 0;
        for (let i = 0; i < body.element_types.length; i++) {
            es_client.index({
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

function update_gamesweek_data(req, res, callback) {
    fs.readFile('fpl_data.json', 'utf8', function (err, data) {
        if (err) throw err;
        var body = JSON.parse(data);
        var counter = 0;
        for (let i = 0; i < body.events.length; i++) {
            es_client.index({
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

module.exports = {
    get_data_from_fpl: get_data_from_fpl,
    update_player_data: update_player_data,
    update_team_data: update_team_data,
    add_player_types_data: add_player_types_data,
    update_gamesweek_data: update_gamesweek_data
}