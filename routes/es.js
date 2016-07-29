var express = require('express');
var router = express.Router();
var es_utils = require('../es_utils');

router.post('/get_data_from_fpl', function(req, res) {
    es_utils.get_data_from_fpl(req, res, function(req, res) {
        res.send('Loaded!');
    });
});

router.post('/update_player_data', function(req, res) {
    es_utils.update_player_data(req, res, function(req, res) {
        res.send('Player data updated!');
    });
});

router.post('/update_team_data', function(req, res) {
    es_utils.update_team_data(req, res, function(req, res) {
        res.send('Team data updated!');
    });
});

router.post('/add_player_type_data', function(req, res) {
    es_utils.add_player_types_data(req, res, function(req, res) {
        res.send('Player types added!');
    });
});

router.post('/update_gamesweek_data', function(req, res) {
    es_utils.update_gamesweek_data(req, res, function(req, res) {
        res.send('Gamesweek data updated!');
    });
});

module.exports = router;