var express = require('express');
var router = express.Router();
var elasticsearch = require('elasticsearch');
var es = new elasticsearch.Client({
    host: 'localhost:9200'
});

router.route('/login')
    .get(function (req, res) {
        res.render('login', { title: "Login", currentRoute: 'login' });
    })
    .post(function (req, res) {
        es.get({
            index: "game",
            type: "account",
            id: req.body.inputUsername
        }, function (error, response) {
            if (response.found && response._source.password === req.body.inputPassword) {
                req.session.user = response._source;
                req.session.loggedIn = true;
                res.redirect('/');
            } else {
                res.redirect('/login');
            }
        });
    });

router.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
});

router.route('/signup')
    .get(function (req, res) {
        res.render('signup', { title: "Signup", currentRoute: "signup" });
    })
    .post(function (req, res) {
        es.create({
            index: "game",
            type: "account",
            id: req.body.inputUsername,
            body: {
                email: req.body.inputEmail,
                username: req.body.inputUsername,
                name: req.body.inputFullName,
                password: req.body.inputPassword,
                team_name: req.body.inputTeamName,
            }
        }, function (error, response) {
            es.get({
                index: "game",
                type: "account",
                id: response._id
            }, function (error, response) {
                req.session.user = response._source;
                req.session.loggedIn = true;
                res.redirect('/');
            });
        });
    });

module.exports = router