var express = require('express');
var router = express.Router();
var esFplUtils = require('../esFplUtils');
var esGameUtils = require('../esGameUtils');

router.get('/get-static', function(req, res) {
    esFplUtils.getStaticDataFromFpl(req, res, function(req, res) {
        res.send('Static data loaded!');
    });
});

router.get('/get-dynamic', function(req, res) {
    esFplUtils.getDynamicDataFromFpl(req, res, function(req, res) {
        res.send('Dynamic data loaded!');
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
    })
})

module.exports = router;