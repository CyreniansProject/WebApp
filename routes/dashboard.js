const express = require('express');
var router = express.Router();
const flash = require('connect-flash');

var User = require('../models/user');

router.get('/', function(req, res) {
    if (req.user) {
        res.render('dashboard', { layout: 'layout_staff.handlebars', page_title: 'Dashboard', user: req.user });
    }
    else {
        req.flash('error_msg', 'You need to login first!');
        res.redirect('/');
    }
});

module.exports = router;