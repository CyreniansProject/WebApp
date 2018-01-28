var express = require('express');
var router = express.Router();

// Homepage
router.get('/', function(req, res) {
	res.render('index', { page_title: 'User authentication' });
});

// Login - GET
router.get('/login', function(req, res) {
	res.render('index', { page_title: 'User authentication' });
});

module.exports = router;