var express = require('express');
var router = express.Router();

router.get('/login', function(req, res) {
    res.render('auth/login');
});

router.get('/logout', function(req, res) {
    // TODO: implement logout logic
    res.redirect('/');
});

router.route('/createuser')
    .get(function(req, res) {
        res.send('New user form.');
    })
    .post(function(req, res) {
        res.send('Processing submitted form.');
    });

router.all('/*', function(req, res, next) {
    // TODO: if already logged in, then redirect to home else to login page
    res.redirect('./login');
});

module.exports = router