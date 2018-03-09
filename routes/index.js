var express = require('express');
var router = express.Router();

// Homepage
router.get('/', function(req, res) {
	res.render('index', { page_title: 'Authentication' });
});

// Login - GET
router.get('/login', function(req, res) {
	res.render('index', { page_title: 'Authentication' });
});

module.exports = router;