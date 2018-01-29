const express = require('express');
var router = express.Router();
const flash = require('connect-flash');

var User = require('../models/user');
var BagContent = require('../models/bagContent');
var FruitPicking = require('../models/fruitPicking');

router.get('/', function(req, res) {
    if (req.user) {
        res.render('stock/index', { layout: 'layout_staff.handlebars', page_title: 'Stock control', user: req.user });
    }
    else {
        req.flash('error_msg', 'You need to login first!');
        res.redirect('/');
    }
});

router.get('/fruit', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            FruitPicking.getAllFruit(function(err, fruit) {
                if (err) throw err;
                res.render('stock/fruitlist', { layout: 'layout_staff.handlebars', page_title: 'Products list', 
                user: req.user, fruits: fruit });
            });
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

router.get('/fruit/create', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            res.render('stock/addFruit', { layout: 'layout_staff.handlebars', page_title: 'Add product', user: req.user });
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

router.post('/fruit/create', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            var item = req.body.item;
            var avgWeight = req.body.avgWeight;

            // Validation
            req.check('item', 'Product name is required').notEmpty();
            req.check('avgWeight', 'Average weight must be added as numeric (kg)').isNumeric();

            // Store validation errors if any...
            var validErrors = req.validationErrors();
            // Attempt User creation
            if (validErrors) {
                res.render('stock/addFruit', { layout: 'layout_staff.handlebars', page_title: 'Add product', errors: validErrors });
            }
            else {
                var newFruit = new FruitPicking({
                    item: item,
                    avgWeight: avgWeight,
                });

                FruitPicking.createFruit(newFruit, function(err, fruit) {
                    if(err) throw err;
        
                    req.flash('success_msg', 'Product was successfully created.');
                    res.redirect('/api/stock/fruit');
                });
            }
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