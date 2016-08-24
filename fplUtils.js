"use strict"
var request = require('request');

var FPL_URL = "https://fantasy.premierleague.com/drf";

exports.getBootstrapStatic = function (callback) {
    request.get({ url: FPL_URL + '/bootstrap-static', json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(body);
        } else {
            throw error;
        }
    });
}

exports.getBootstrapDynamic = function() {
    request.get({ url: FPL_URL + '/bootstrap-dynamic', json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            return body;
        } else {
            throw error;
        }
    });
}

exports.getElements = function () {
    request.get({ url: FPL_URL + '/elements', json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            return body;
        } else {
            throw error;
        }
    });
}

exports.getFixtures = function (event) {
    var query = (event) ? '?event=' + event : '';
    request.get({ url: FPL_URL + '/fixtures/' + query, json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            return body;
        } else {
            throw error;
        }
    });
}

exports.getElementSummary = function (id) {
    request.get({ url: FPL_URL + '/element-summary/' + id, json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            return body;
        } else {
            throw error;
        }
    });
}

exports.getEventLive = function (id) {
    request.get({ url: FPL_URL + '/event/' + id + '/live', json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            return body;
        } else {
            throw error;
        }
    });
}