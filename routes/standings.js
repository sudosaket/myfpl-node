var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Team = require('../models/Team');
var Account = require('../models/Account');

router.get('/standings', function (req, res, next) {
    if (req.session.loggedIn !== true) {
        res.redirect('/login?next=standings');
    } else {
        Team.aggregate([
            {
                $group: {
                    _id: '$username',
                    totalPoints: { $sum: '$points' }
                }
            },
            {
                $sort: { 'totalPoints': -1 }
            }
        ], function (err, result) {
            req.teams = result;
            next();
        });
    }
}, function (req, res, next) {
    Account.find().select('username name teamName').exec(function (err, accounts) {
        req.teams.forEach(function(team, index, arr) {
            for (var i = 0; i < accounts.length; i++) {
                if (accounts[i].username === team._id) {
                    arr[index].teamName = accounts[i].teamName;
                    arr[index].name = accounts[i].name;
                }
            }
        }, this);
        res.render('standings', { title: 'Standings', currentRoute: 'standings', teams: req.teams, accounts: accounts });
    });
});

module.exports = router