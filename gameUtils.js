"use strict"
var request = require('request');
var fs = require('fs');
var mongoose = require('mongoose');
var Account = require('./models/Account');
var Player = require('./models/Player');
var Team = require('./models/Team');
var TransferOrder = require('./models/TransferOrder');

exports.initTransferOrder = function (callback) {
    Account.find({}, 'username', function (err, accounts) {
        var done = 0;
        accounts.forEach(function (account, index, accounts) {
            TransferOrder.create({
                next: accounts[(index + 1) % accounts.length].username,
                started: index === 0
            }, function (err, transferOrder) {
                done += 1;
                if (done === accounts.length) callback();
            })
        }, this);
    });
}

exports.advanceGamesweek = function (currentEvent, callback) {
    Account.update({}, { $set: { transferLimit: 1 } }, { multi: true }, function (err, raw) {
        Team.find({ event: currentEvent }, function (err, teams) {
            var done = 0;
            teams.forEach(function (team, index, arr) {
                var team = team.toObject();
                delete team._id;
                team.points = 0;
                team.event = team.event+1;
                Team.update({ username: team.username, event: team.event}, team, {upsert: true}, (err, team) => {
                    done += 1;
                    if (done === teams.length) callback();
                });
            }, this);
        });
    });
}