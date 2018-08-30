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

// App;icatoin Error - GET
router.get('/app-error', function(req, res) {
	res.render('app_error', { page_title: 'Application error' });
});

module.exports = router;