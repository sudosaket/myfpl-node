var express = require('express');
var router = express.Router();
var elasticsearch = require('elasticsearch');
var es = new elasticsearch.Client({
    host: 'localhost:9200'
});

router.get('/', function (req, res, next) {
    es.search({
        index: "game",
        type: "account",
        body: {
            _source: ["name", "username", "team_name"]
        }
    }, function (error, response) {
        if (error) throw error;
        res.render('admin/admin.pug', { title: 'Dev Panel', accounts: response.hits.hits });
    })
});

router.post('/set-transfer-turn', function (req, res) {
    es.update({
        index: "game",
        type: "account",
        id: req.body.username,
        body: {
            doc: {
                transfer_turn: true
            }
        }
    }, function (error, response) {
        if (error) throw error;
        res.redirect(req.baseUrl);
    });
});

module.exports = router;