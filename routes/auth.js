var express = require('express');
var router = express.Router();
var elasticsearch = require('elasticsearch');
var es = new elasticsearch.Client({
    host: 'localhost:9200'
});

router.route('/login')
    .get(function (req, res) {
        res.render('login', { title: "Login", currentRoute: 'login', query: req.query });
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
                if (req.query.next) {
                    res.redirect(req.query.next);
                } else {
                    res.redirect('/');
                }
            } else if (!response.found) {
                res.redirect('/login?err=username');
            } else {
                res.redirect('/login?err=password');
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

router.route('/settings')
    .get(function (req, res) {
        if (req.session.loggedIn) {
            res.render('settings', { title: 'Settings' });
        } else {
            res.redirect('login?next=settings');
        }
    })
    .post(function (req, res) {
        var doc = {};
        if (req.body.inputName && req.body.inputName !== "") {
            doc["name"] = req.body.inputName;
        }
        if (req.body.inputEmail && req.body.inputEmail !== "") {
            doc["email"] = req.body.inputEmail;
        }
        if (req.body.inputUsername && req.body.inputUsername !== "") {
            doc["username"] = req.body.inputUsername;
        }
        if (req.body.inputTeamName && req.body.inputTeamName !== "") {
            doc["team_name"] = req.body.inputTeamName;
        }
        if (req.session.loggedIn) {
            es.update({
                index: "game",
                type: "account",
                id: req.session.user.username,
                body: {
                    doc: doc
                }
            }, function (error, response) {
                if (error) throw error;
                es.get({
                    index: "game",
                    type: "account",
                    id: response._id
                }, function (error, response) {
                    req.session.user = response._source;
                    req.session.loggedIn = true;
                    res.redirect('settings?done=true')
                });
            });
        } else {
            res.redirect('login?next=settings');
        }
    })

module.exports = router