const express = require('express');
var router = express.Router();
const flash = require('connect-flash');

// schemas
var Product = require('../models/product');
var Picking = require('../models/picking');
var Purchasing = require('../models/purchasing');

// schema helpers
const lastResultHelper = require('../models/helpers/lastResult');

// PRODUCTS ROUTING

router.get('/', function(req, res) { res.redirect('/api/stock/products'); });

router.get('/products', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            var products = [];
            Product.listProducts(function(err, productList) {
                if (err) throw err;
                var count = productList.length;

                productList.forEach(product => {
                    lastResultHelper.getLastHarvest(product, function(lhErr, lastHarvest) {
                        if (lhErr) throw lhErr;
                        lastResultHelper.getLastPurchase(product, function(lpErr, lastPurchase) {
                            if (lpErr) throw lpErr;
                            
                            products.push({
                                product: product,
                                lastHarvest: lastHarvest,
                                lastPurchase: lastPurchase
                            });
                            count--;
                            
                            if (count == 0) {
                                res.render('stock/products/index', { layout: 'layout_staff.handlebars', page_title: 'Products list', 
                                user: req.user, products: products });
                            }
                        });
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

            // Validation
            req.check('itemName', 'Product name is required').notEmpty();
            req.check('avgWeight', 'Average weight (number) is required').notEmpty();
            // Store validation errors if any...
            var validErrors = req.validationErrors();
    
            // Attempt User creation
            if (validErrors) {
                req.flash('valid_msg', validErrors[0].msg);
                res.redirect('back');
            }
            else {
                const productDetails = {
                    name: name,
                    avgWeight: avgWeight
                };

                Product.createProduct(productDetails, function(err, product) {
                    if(err) throw err;
                    req.flash('success_msg', 'Product successfully created!');
                    res.redirect('/api/stock/products');
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

            // Validation
            req.check('itemName', 'Product name is required').notEmpty();
            req.check('avgWeight', 'Average weight (number) is required').notEmpty();
            // Store validation errors if any...
            var validErrors = req.validationErrors();
    
            // Attempt User creation
            if (validErrors) {
                req.flash('valid_msg', validErrors[0].msg);
                res.redirect('back');
            }
            else {
                const productDetails = {
                    name: name,
                    avgWeight: avgWeight
                };

                Product.updateProduct(id, productDetails, function(err, product) {
                    if (err) throw err; 
                    req.flash('success_msg', 'Product successfully updated!');
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
            const startDate = req.query['startDate'];
            const endDate = req.query['endDate'];
            var criteria;
            if (startDate && endDate) {
                criteria = {
                    startDate: startDate,
                    endDate: endDate
                }
            }
            else if (startDate) {
                criteria = {
                    startDate: startDate,
                }
            }
            else if (endDate) {
                criteria = {
                    endDate: endDate
                }
            }
            else {
                criteria = {}
            }

            Picking.listHarvests(productId, criteria, function(err, harvests) {
                if (err) throw err;
                Product.findById({_id: productId}, function(cErr, product) {
                    if (cErr) throw cErr;
                    res.render('stock/harvests/index', { layout: 'layout_staff.handlebars', page_title: 'Harvestings for ' + product.name, 
                    user: req.user, harvests: harvests, productId: productId, criteria: criteria });
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
            const date = req.body.pickingDate;

            // Validation
            req.check('amountHarvested', 'Haversted amount (number) is required').notEmpty();
            req.check('pickingDate', 'Harvesting date (selection) is required').notEmpty();
            // Store validation errors if any...
            var validErrors = req.validationErrors();
    
            // Attempt User creation
            if (validErrors) {
                req.flash('valid_msg', validErrors[0].msg);
                res.redirect('back');
            }
            else {
                const pickingDetails = {
                    amountHarvested: amountHarvested,
                    date: date
                };

                Picking.addHaverst(productId, pickingDetails, function(err, picking) {
                    if (err) throw err;
                    req.flash('success_msg', 'Harvesting successfully added!');
                    res.redirect('/api/stock/harvests/to/' + productId);
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
            const date = req.body.pickingDate;

            // Validation
            req.check('amountHarvested', 'Haversted amount (number) is required').notEmpty();
            req.check('pickingDate', 'Harvesting date (selection) is required').notEmpty();
            // Store validation errors if any...
            var validErrors = req.validationErrors();
    
            // Attempt User creation
            if (validErrors) {
                req.flash('valid_msg', validErrors[0].msg);
                res.redirect('back');
            }
            else {
                const pickingDetails = {
                    amountHarvested: amountHarvested,
                    date: date
                };

                Picking.updateHarvest(id, pickingDetails, function(err, harvest) {
                    if (err) throw err;
                    req.flash('success_msg', 'Harvesting successfully updated!');
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

router.get('/harvests/remove/:id', function(req, res) {
    const id = req.params.id;

    Picking.removeHarvest(id, function(err) {
        if (err) throw err;
        req.flash('success_msg', 'Harvesting successfully removed!');
        res.redirect('back');
    });
});

// PURCHASING ROUTING

router.get('/purchases/to/:productId', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const productId = req.params.productId;
            const startDate = req.query['startDate'];
            const endDate = req.query['endDate'];
            var criteria;
            if (startDate && endDate) {
                criteria = {
                    startDate: startDate,
                    endDate: endDate
                }
            }
            else if (startDate) {
                criteria = {
                    startDate: startDate,
                }
            }
            else if (endDate) {
                criteria = {
                    endDate: endDate
                }
            }
            else {
                criteria = {}
            }

            Purchasing.listPurchases(productId, criteria, function(err, purchases) {
                if (err) throw err;
                Product.findById({_id: productId}, function(cErr, product) {
                    if (cErr) throw cErr;
                    res.render('stock/purchases/index', { layout: 'layout_staff.handlebars', page_title: 'Purchases for ' + product.name, 
                    user: req.user, purchases: purchases, productId: productId, criteria: criteria });
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

router.get('/purchases/to/:productId/new', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const productId = req.params.productId;
            Product.findById({_id: productId}, function(err, product) {
                if (err) throw err;
                res.render('stock/purchases/addPurchase', { layout: 'layout_staff.handlebars', page_title: 'New purchase for ' + product.name, 
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

router.post('/purchases/new', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const productId = req.body.productId;
            
            const amountPurchased = req.body.amountPurchased;
            const date = req.body.purchaseDate;
            const price = req.body.price;
            // Validation
            req.check('amountPurchased', 'Haversted amount (number) is required').notEmpty();
            req.check('purchaseDate', 'Purchase date (selection) is required').notEmpty();
            req.check('price', 'Price (number) is required').notEmpty();
            // Store validation errors if any...
            var validErrors = req.validationErrors();
    
            // Attempt User creation
            if (validErrors) {
                req.flash('valid_msg', validErrors[0].msg);
                res.redirect('back');
            }
            else {
                const purchaseDetails = {
                    amountPurchased: amountPurchased,
                    date: date,
                    price: price
                };

                Purchasing.addPurchase(productId, purchaseDetails, function(err, purchase) {
                    if (err) throw err;
                    req.flash('success_msg', 'Purchase successfully added!');
                    res.redirect('/api/stock/purchases/to/' + productId);
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

router.get('/purchases/edit/:id', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const id = req.params.id;

            Purchasing.findById({_id: id}, function(err, purchase) {
                if (err) throw err;
                purchase.populate({
                    path:'product'
                }, function(err) {
                    if (err) throw err;
                    res.render('stock/purchases/editPurchase', { layout: 'layout_staff.handlebars', 
                    page_title: 'Edit purchase for ' + purchase.product.name, 
                    user: req.user, purchase: purchase });
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

router.post('/purchases/update', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const id = req.body.purchaseId;
            
            const amountPurchased = req.body.amountPurchased;
            const date = req.body.purchaseDate;
            const price = req.body.price;

            // Validation
            req.check('amountPurchased', 'Haversted amount (number) is required').notEmpty();
            req.check('purchaseDate', 'Purchase date (selection) is required').notEmpty();
            req.check('price', 'Price (number) is required').notEmpty();
            // Store validation errors if any...
            var validErrors = req.validationErrors();
    
            // Attempt User creation
            if (validErrors) {
                req.flash('valid_msg', validErrors[0].msg);
                res.redirect('back');
            }
            else {
                const purchaseDetails = {
                    amountPurchased: amountPurchased,
                    date: date,
                    price: price
                };

                Purchasing.updatePurchase(id, purchaseDetails, function(err, purchase) {
                    if (err) throw err;
                    req.flash('success_msg', 'Purchase successfully updated!');
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

router.get('/purchases/remove/:id', function(req, res) {
    const id = req.params.id;

    Purchasing.removePurchase(id, function(err) {
        if (err) throw err;
        req.flash('success_msg', 'Purchase successfully removed!');
        res.redirect('back');
    });
});

module.exports = router;