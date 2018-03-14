var express = require('express');
var router = express.Router();

// Driver Landing - GET
router.get('/', function(req, res) {
    if (req.user) {
        if (req.user.role == 2) {
            res.render('driver/index', { layout: 'layout_staff.handlebars', page_title: '', user: req.user });
        }
        else {
            req.flash('error_msg', 'You don\'t have the authority to access this page!');
			res.redirect('/api/dashboard');
        }
    }
    else {
        req.flash('error_msg', 'You need to login first!');
        res.redirect('/');
    }
});

module.exports = router;