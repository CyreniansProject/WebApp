const express = require('express');
var router = express.Router();
const flash = require('connect-flash');

var User = require('../models/user');

router.get('/', function(req, res) {
    if (req.user) {
        res.render('stock/index', { layout: 'layout_staff.handlebars', page_title: 'Stock control', user: req.user });
    }
    else {
        req.flash('error_msg', 'You need to login first!');
        res.redirect('/');
    }
});

module.exports = router;