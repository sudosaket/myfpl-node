var express = require('express');
var router = express.Router();
var esFplUtils = require('../esFplUtils');

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

module.exports = router;