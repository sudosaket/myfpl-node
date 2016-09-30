"use strict"
var request = require('request');
var fs = require('fs');

var FPL_URL = "https://fantasy.premierleague.com/drf";

exports.getBootstrapStatic = function (callback) {
    request.get({ url: FPL_URL + '/bootstrap-static', json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            fs.writeFile('public/data/bootstrap-static.json', JSON.stringify(body, null, 4), function (err) {
                if (err) throw err;
                callback();
            });
        } else {
            throw error;
        }
    });
}

exports.getBootstrapDynamic = function (callback) {
    request.get({ url: FPL_URL + '/bootstrap-dynamic', json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            fs.writeFile('public/data/bootstrap-dynamic.json', JSON.stringify(body, null, 4), function (err) {
                if (err) throw err;
                callback();
            });
        } else {
            throw error;
        }
    });
}

exports.getElements = function (callback) {
    request.get({ url: FPL_URL + '/elements', json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            fs.writeFile('public/data/elements.json', JSON.stringify(body, null, 4), function (err) {
                if (err) throw err;
                callback();
            });
        } else {
            throw error;
        }
    });
}

exports.getFixtures = function (callback) {
    request.get({ url: FPL_URL + '/fixtures', json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            fs.writeFile('public/data/fixtures.json', JSON.stringify(body, null, 4), function (err) {
                if (err) throw err;
                callback();
            });
        } else {
            throw error;
        }
    });
}

exports.getEventLive = function (id, callback) {
    request.get({ url: FPL_URL + '/event/' + id + '/live', json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            fs.writeFile('public/data/event/' + id + '.json', JSON.stringify(body, null, 4), function (err) {
                if (err) throw err;
                callback();
            });
        } else {
            throw error;
        }
    });
}

exports.getElementSummary = function (id, callback) {
    request.get({ url: FPL_URL + '/element-summary/' + id, json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            fs.writeFile('public/data/elements/' + id + '.json', JSON.stringify(body, null, 4), function (err) {
                if (err) throw err;
                callback();
            });
        } else {
            throw error;
        }
    });
}