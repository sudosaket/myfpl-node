"use strict"
var request = require('request');
var fs = require('fs');

exports.getBootstrapStatic = function () {
    request.get({ url: FPL_URL + '/bootstrap-static', json: true }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            return body;
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