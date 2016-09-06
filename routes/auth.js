var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Account = require('../models/Account');

router.route('/login')
	.get(function (req, res) {
		res.render('login', { title: "Login", currentRoute: 'login', query: req.query });
	})
	.post(function (req, res) {
		Account.findOne({ username: req.body.inputUsername }, function (err, account) {
			if (account.password === req.body.inputPassword) {
				req.session.user = account;
				delete req.session.user.password;
				req.session.loggedIn = true;
				if (req.query.next) {
					res.redirect(req.query.next);
				} else {
					res.redirect('/');
				}
			} else if (!account) {
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
		res.render('signup', { title: "Signup", currentRoute: "signup", query: req.query });
	})
	.post(function (req, res) {
		Account.findOne({ username: req.body.inputUsername }, function (err, account) {
			if (account) {
				res.redirect('/signup?err=username');
			} else {
				Account.find({ email: req.body.inputEmail }, function (err, accounts) {
					if (accounts.length > 0) {
						res.redirect('/signup?err=email');
					} else {
						var acc = new Account({
							"email": req.body.inputEmail,
							"username": req.body.inputUsername,
							"name": req.body.inputFullName,
							"password": req.body.inputPassword,
							"teamName": req.body.inputTeamName,
							"transferTurn": false,
							"transferLimit": 11
						});
						acc.save(function (err, acc) {
							if (err) throw err;
							req.session.user = acc;
							delete req.session.user.password;
							req.session.loggedIn = true;
							res.redirect('/');
						});
					}
				});
			}
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
			doc["teamName"] = req.body.inputTeamName;
		}
		if (req.session.loggedIn) {
			Account.findOneAndUpdate({ username: req.session.user.username }, doc, function (err, account) {
				req.session.user = account;
				delete req.session.user.password;
				req.session.loggedIn = true;
				res.redirect('settings?done=true');
			});
		} else {
			res.redirect('login?next=settings');
		}
	});

module.exports = router