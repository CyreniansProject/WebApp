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
            
            var products;
            try {
                const o = JSON.parse(req.body.products);
                if (o && typeof o === "object")
                    products = o;
            }
            catch (e) {
                req.flash('error_msg', 'Cannot have a bag with 0 products inside!');
                return res.redirect('back');
            }

            const priceSmall = req.body.priceSmall;
            const priceMedium = req.body.priceMedium;
            const priceLarge = req.body.priceLarge;
            const startDate = req.body.startDate;
            const endDate = req.body.endDate;

            // Validation
            req.check('priceSmall', 'Small bag price (number) is required').isNumeric();
            req.check('priceMedium', 'Medium bag price (number) is required').isNumeric();
            req.check('priceLarge', 'Large bag price (number) is required').isNumeric();
            req.check('startDate', 'Active period: From date (selection) is required').notEmpty();
            req.check('endDate', 'Active period: To date (selection) is required').notEmpty();
            // Store validation errors if any...
            var validErrors = req.validationErrors();

            // Attempt User creation
            if (validErrors) {
                req.flash('valid_msg', validErrors[0].msg);
                res.redirect('back');
            }
            else {
                var productList = [];
                products.forEach(product => {
                    productList.push(product);
                });

                const bagDetails = {
                    startDate: startDate,
                    endDate: endDate,
                    priceSmall: priceSmall,
                    priceMedium: priceMedium,
                    priceLarge: priceLarge
                };
                
                Bag.createBag(bagDetails, productList, function(err, bagContent) {
                    if (err) throw err;
                    req.flash('success_msg', 'Bag successfully created!');
                    res.redirect('/api/bags/');
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

router.get('/edit/:id', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const id = req.params.id;
            
            Bag.findById({_id: id}, function(err, bagContent) {
                if (err) throw err;
                bagContent.populate({
                    path: 'product'
                }, function(pErr) {
                    if (pErr) throw pErr;
                    Product.listProducts(function(lpErr, products) {
                        if (lpErr) throw lpErr;
                        res.render('bags/editBag', { layout: 'layout_staff.handlebars', 
                        page_title: 'Bag (' + bagContent.startDate + ' - ' + bagContent.endDate + ')', 
                        user: req.user, bagContent: bagContent, products: products });
                    });
                });
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

router.post('/update', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const id = req.body.bagId;
            
            var products;
            try {
                const o = JSON.parse(req.body.products);
                if (o && typeof o === "object")
                    products = o;
            }
            catch (e) {
                req.flash('error_msg', 'Cannot have a bag with 0 products inside!');
                return res.redirect('back');
            }
            
            const priceSmall = req.body.priceSmall;
            const priceMedium = req.body.priceMedium;
            const priceLarge = req.body.priceLarge;
            const startDate = req.body.startDate;
            const endDate = req.body.endDate;

            // Validation
            req.check('priceSmall', 'Small bag price (number) is required').isNumeric();
            req.check('priceMedium', 'Medium bag price (number) is required').isNumeric();
            req.check('priceLarge', 'Large bag price (number) is required').isNumeric();
            req.check('startDate', 'Active period: From date (selection) is required').notEmpty();
            req.check('endDate', 'Active period: To date (selection) is required').notEmpty();
            // Store validation errors if any...
            var validErrors = req.validationErrors();

            // Attempt User creation
            if (validErrors) {
                req.flash('valid_msg', validErrors[0].msg);
                res.redirect('back');
            }
            else {
                var productList = [];
                products.forEach(product => {
                    productList.push(product);
                });

                const bagDetails = {
                    startDate: startDate,
                    endDate: endDate,
                    priceSmall: priceSmall,
                    priceMedium: priceMedium,
                    priceLarge: priceLarge
                };

                Bag.updateBag(id, bagDetails, productList, function(err, bagContent) {
                    if (err) throw err;
                    req.flash('success_msg', 'Bag successfully updated!');
                    res.redirect('back');
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

router.get('/remove/:id', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const id = req.params.id;
            
            Bag.removeBag(id, function(err) {
                if (err) throw err;
                req.flash('success_msg', 'Bag successfully removed!');
                res.redirect('back');
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