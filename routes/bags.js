const express = require('express');
var router = express.Router();
const flash = require('connect-flash');

const Bag = require('../models/bag');
const Product = require('../models/product');

router.get('/', function(req, res) { 
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            Bag.listBags(function(err, bags) {
                if (err) throw err;
                res.render('bags/index', { layout: 'layout_staff.handlebars', page_title: 'Bags list', 
                user: req.user, bags: bags });
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

router.get('/new', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            Product.listProducts(function(err, products) {
                res.render('bags/addBag', { layout: 'layout_staff.handlebars', page_title: 'New bag', user: req.user,
                products: products });
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

router.post('/new', function(req, res) { 
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const products = JSON.parse(req.body.products);
            const startDate = req.body.startDate;
            const endDate = req.body.endDate;
            const smallPrice = req.body.smallPrice;
            const mediumPrice = req.body.mediumPrice;
            const largePrice = req.body.largePrice;

            var productList = []
            products.forEach(productName => {
                // find product information based on the product name
                Product.findOne({name: productName}, function(err, product) {
                    if (err) throw err;
                    productList.push(product);
                });
            });

            const bagDetails = {
                startDate: dateOfCreation,
                endDate: dateOfCreation,
                smallPrice: smallPrice,
                mediumPrice: mediumPrice,
                largePrice: largePrice
            };
            
            Bag.createBag(bagDetails, productList, function(err, bagContent) {
                if (err) throw err;
                req.flash('success_msg', 'Bag successfully created!');
                res.send("In development..." + bagContent);
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

module.exports = router;