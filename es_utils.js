var request = require('request');
// elasticsearch setup
var elasticsearch = require('elasticsearch');
var esclient = new elasticsearch.Client({
    host: 'localhost:9200'
});

var data_file;

function get_data_file_from_fpl() {
    request.get({ url: 'https://fantasy.premierleague.com/drf/bootstrap-static', json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            data_file = body;
        } else {
            throw error;
        }
    });
}

function update_players_data() {
    if (data_file != null) {
        for (let i = 0; i < body.elements.length; i++) {
            esclient.index({
                index: 'myfpl',
                type: 'player',
                id: body.elements[i].id,
                body: body.elements[i]
            }, function (error, response) {
                console.log('# ' + (i + 1) + '. ' + body.elements[i].web_name + ' inserted!');
            });
        }
    }
}

function update_teams_data() {
    if (data_file != null) {
        for (let i = 0; i < body.teams.length; i++) {
            esclient.index({
                index: 'myfpl',
                type: 'team',
                id: body.teams[i].id,
                body: body.teams[i]
            }, function (error, response) {
                console.log('# ' + (i + 1) + '. ' + body.elements[i].name + ' updated!');
            });
        }
    }
}

function add_player_types_data() {
    if (data_file != null) {
        for (let i = 0; i < body.element_types.length; i++) {
            esclient.index({
                index: 'myfpl',
                type: 'player_type',
                id: body.element_types[i].id,
                body: body.element_types[i]
            }, function (error, response) {
                console.log('# ' + (i + 1) + '. Player type ' + body.element_types[i].singular_name + ' added!');
            });
        }
    }
}

function update_gamesweek_data() {
    if (data_file != null) {
        for (let i = 0; i < body.events.length; i++) {
            esclient.index({
                index: 'myfpl',
                type: 'gamesweek',
                id: body.events[i].id,
                body: body.events[i]
            }, function (error, response) {
                console.log('# ' + (i + 1) + '. ' + body.elements[i].name + ' updated!');
            });
        }
    }
}