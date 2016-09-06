var express = require('express');
var fs = require('fs');
var router = express.Router();
var moment = require('moment-timezone');
var Account = require('../models/Account');
var Player = require('../models/Player');
var Team = require('../models/Team');
var TransferOrder = require('../models/TransferOrder');

router.get('/transfers', function (req, res, next) {
    fs.readFile('public/data/bootstrap-dynamic.json', 'utf8', function (err, data) {
        if (err) throw err;
        var body = JSON.parse(data);
        req.fixtures = body.next_event_fixtures;
        for (var i = 0; i < req.fixtures.length; i++) {
            req.fixtures[i].kickoff_time = moment.tz(new Date(req.fixtures[i].kickoff_time), "Asia/Kolkata").format();
            req.fixtures[i].kickoff_time_formatted = moment.tz(new Date(req.fixtures[i].kickoff_time), "Asia/Kolkata").format("D MMM HH:mm");
        }
        next();
    });
}, function (req, res, next) {
    fs.readFile('public/data/bootstrap-static.json', 'utf8', function (err, data) {
        if (err) throw err;
        var body = JSON.parse(data);
        req.teams = body.teams;
        req.players = body.elements;
        req.elementTypes = body.element_types;
        next();
    });
}, function (req, res, next) {
    Player.find().exec(function (err, players) {
        players.forEach(function (player) {
            if (!player.isAvailable) {
                req.players[player._id].is_available = false;
            }
        }, this);
        next();
    });
}, function (req, res, next) {
    if (req.session.loggedIn !== true) {
        res.redirect('/login?next=transfers');
    } else {
        Team.findOne({ username: req.session.user.username, event: req.app.locals.event + 1 }, function (err, team) {
            if (team) {
                req.myTeam = team;
            }
            next();
        });
    }
}, function (req, res, next) {
    Account.findOne({ username: req.session.user.username }, function (err, account) {
        req.session.user.transferLimit = account.transferLimit;
        req.session.user.transferTurn = account.transferTurn;
        next();
    });
}, function (req, res, next) {
    res.render('transfers', {
        title: "Transfers",
        currentRoute: "transfers",
        players: req.players,
        elementTypes: req.elementTypes,
        teams: req.teams,
        myTeam: req.myTeam,
        transferLimit: req.session.user.transferLimit,
        transferTurn: req.session.user.transferTurn,
        fixtures: req.fixtures
    });
});

router.post('/transfers', function (req, res, next) {
    if (req.session.loggedIn !== true) {
        res.redirect('/login?next=transfers');
    } else {
        next();
    }
}, function (req, res, next) {
    var playerIn = +req.body.playerIn;
    var playerOut = (req.body.playerOut != undefined) ? +req.body.playerOut : -1;
    Team.update({
        username: req.session.user.username,
        event: req.app.locals.event
    }, { $push: { transfers: { in: playerIn, out: playerOut } } }, function (err, team) {
        req.currentTeam = team;
        next();
    });
}, function (req, res, next) {
    var playerIn = +req.body.playerIn;
    var playerOut = (req.body.playerOut != undefined) ? +req.body.playerOut : -1;
    Team.findOne({ username: req.session.user.username, event: req.app.locals.event + 1 }, (err, team) => {
        if (playerOut < 0) {
            team.players.push(playerIn);
        } else {
            team.players.forEach(function (player, index, arr) {
                if (player === +req.body.playerOut);
                arr[index] = playerIn;
            }, this);
        }
        team.save();
    });
}, function (req, res, next) {
    Player.findOneAndUpdate({ _id: +req.body.playerIn }, { $set: { isAvailable: false } }, function (err, player) {
        next();
    });
}, function (req, res, next) {
    if (req.body.playerOut != undefined) {
        Player.findOneAndUpdate({ _id: +req.body.playerOut }, { $set: { isAvailable: true } }, function (err, player) {
            next();
        });
    } else {
        next();
    }
}, function (req, res, next) {
    Account.findOneAndUpdate({ username: req.session.user.username }, { $inc: { transferLimit: -1 } }, function (err, account) {
        next();
    });
}, function (req, res, next) {
    TransferOrder.findOne({ username: req.session.user.username }, function (err, transferOrder) {
        req.nextAccount = transferOrder.next;
        next();
    });
}, function (req, res, next) {
    TransferOrder.findOne({ username: req.nextAccount }, function (err, transferOrder) {
        if (transferOrder.started) {
            TransferOrder.update({ username: req.nextAccount }, { $set: { started: false } });
            Account.update({username: transferOrder.next}, {$set: {transferTurn: true}});
            TransferOrder.update({ username: transferOrder.next }, { $set: { started: true } }, function (err, transferOrder) {
                req.session.user.transfer_limit -= 1;
                req.session.user.transfer_turn = false;
                res.redirect('transfers');
            });
        } else {
            Account.update({ username: transferOrder.next }, { $set: { transferTurn: true } }, function (err, account) {
                req.session.user.transfer_limit -= 1;
                req.session.user.transfer_turn = false;
                res.redirect('transfers');
            });
        }
    });
});

module.exports = router;