const express = require('express');
var router = express.Router();
const flash = require('connect-flash');

var Product = require('../models/product');
var Picking = require('../models/picking');

// PRODUCTS ROUTING

router.get('/', function(req, res) { res.redirect('/api/stock/products'); });

router.get('/products', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            Product.listProducts(function(err, products) {
                if (err) throw err;
                res.render('stock/products/index', { layout: 'layout_staff.handlebars', page_title: 'Products list', 
                user: req.user, products: products });
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

router.get('/products/new', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            res.render('stock/products/addProduct', { layout: 'layout_staff.handlebars', page_title: 'New product', user: req.user });
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

router.post('/products/new', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const name = req.body.itemName;
            const avgWeight = req.body.avgWeight;

            const productDetails = {
                name: name,
                avgWeight: avgWeight,
            };

            Product.createProduct(productDetails, function(err, product) {
                if(err) throw err;
                req.flash('success_msg', 'Product successfully created!');
                res.redirect('/api/stock/products');
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

router.get('/products/edit/:id', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const id = req.params.id;
            Product.findById({_id: id}, function(err, product) {
                if (err) throw err;
                res.render('stock/products/editProduct', { layout: 'layout_staff.handlebars', page_title: 'Edit ' + product.name,
                user: req.user, product: product, productId: id});
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

router.post('/products/update', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const id = req.body.productId;

            const name = req.body.itemName;
            const avgWeight = req.body.avgWeight;

            // VALIDATION ... TODO

            const productDetails = {
                name: name,
                avgWeight: avgWeight,
            };

            Product.updateProduct(id, productDetails, function(err, product) {
                if (err) throw err; 
                req.flash('success_msg', 'Product successfully updated!');
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

router.get('/products/remove/:id', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const id = req.params.id;
            Product.removeProduct(id, function(err) {
                if (err) throw err;
                req.flash('success_msg', 'Product successfully removed!');
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

// HARVESTING ROUTING

router.get('/harvests/to/:productId', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const productId = req.params.productId;
            Picking.listHarvests(productId, function(err, harvests) {
                if (err) throw err;
                Product.findById({_id: productId}, function(cErr, product) {
                    if (cErr) throw cErr;
                    res.render('stock/harvests/index', { layout: 'layout_staff.handlebars', page_title: 'Harvestings for ' + product.name, 
                    user: req.user, harvests: harvests, productId: productId });
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

router.get('/harvests/to/:productId/new', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const productId = req.params.productId;
            Product.findById({_id: productId}, function(err, product) {
                if (err) throw err;
                res.render('stock/harvests/addHarvest', { layout: 'layout_staff.handlebars', page_title: 'New harvesting for ' + product.name, 
                user: req.user, productId: productId});
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

router.post('/harvests/new', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const productId = req.body.productId;
            
            const amountHarvested = req.body.amountHarvested;
            const pickingWeek = req.body.pickingWeek;

            // VALIDATION ... TODO

            const pickingDetails = {
                amountHarvested: amountHarvested,
                pickingWeek: pickingWeek
            };

            Picking.addHaverst(productId, pickingDetails, function(err, picking) {
                if (err) throw err;
                req.flash('success_msg', 'Harvesting successfully added!');
                res.redirect('/api/stock/harvests/to/' + productId);
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

router.get('/harvests/edit/:id', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const id = req.params.id;

            Picking.findById({_id: id}, function(err, harvest) {
                if (err) throw err;
                harvest.populate({
                    path:'product'
                }, function(err) {
                    if (err) throw err;
                    res.render('stock/harvests/editHarvest', { layout: 'layout_staff.handlebars', page_title: 'Edit harvesting for ' + harvest.product.name, 
                    user: req.user, harvest: harvest });
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

router.post('/harvests/update', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const id = req.body.harvestId;
            
            const amountHarvested = req.body.amountHarvested;
            const pickingWeek = req.body.pickingWeek;

            // VALIDATION ... TODO

            const pickingDetails = {
                amountHarvested: amountHarvested,
                pickingWeek: pickingWeek
            };

            Picking.updateHarvest(id, pickingDetails, function(err, harvest) {
                if (err) throw err;
                req.flash('success_msg', 'Harvesting successfully updated!');
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

router.get('/harvests/remove/:id', function(req, res) {
    const id = req.params.id;

    Picking.removeHarvest(id, function(err) {
        if (err) throw err;
        req.flash('success_msg', 'Harvesting successfully removed!');
        res.redirect('back');
    });
});

module.exports = router;