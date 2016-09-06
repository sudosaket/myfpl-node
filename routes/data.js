"use strict"
var express = require('express');
var router = express.Router();
var fs = require('fs');
var fplUtils = require('../fplUtils');
var gameUtils = require('../gameUtils');

// Routes to modify data

router.get('/bootstrap-static', function (req, res, next) {
    fplUtils.getBootstrapStatic(next);
}, (req, res, next) => {
    res.send("Static data loaded!");
});

router.get('/bootstrap-dynamic', function (req, res, next) {
    fplUtils.getBootstrapDynamic(next);
}, (req, res, next) => {
    res.send("Dynamic data loaded!");
});

router.get('/elements', function (req, res, next) {
    fplUtils.getElements(next);
}, (req, res, next) => {
    res.send("Element data loaded!");
});

router.get('/fixtures', function (req, res, next) {
    fplUtils.getFixtures(next);
}, (req, res, next) => {
    res.send("Fixture data loaded!");
});

router.get('/event/:event', function (req, res, next) {
    var id = (req.params.event) ? req.params.event : req.app.locals.event;
    fplUtils.getEventLive(id, next);
}, (req, res, next) => {
    res.send('Event data loaded!');
});

router.get('/element-summary/:element', function (req, res, next) {
    fplUtils.getElementSummary(req.params.element, next);
}, (req, res, next) => {
    res.send('Element summary loaded!');
});

// Routes to change game status

router.get('/advance-gamesweek', function (req, res, next) {
    gameUtils.advanceGamesweek(req.app.locals.event, () => {
        res.send('Gamesweek advanced!');
    });
});

router.get('/init-transfer-order', function (req, res, next) {
    gameUtils.initTransferOrder(next);
}, function (req, res, next) {
    res.send('Transfer order set!');
});

module.exports = router;