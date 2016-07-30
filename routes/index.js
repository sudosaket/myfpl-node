var express = require('express');
var router = express.Router();

router.all('/', function (req, res) {
  res.render('index', { title: 'Express', currentRoute: 'index' });
});

module.exports = router