const express = require('express');
const router = express.Router();

// helpers
const _ = require('lodash');
const flash = require('connect-flash');

// models / schemas
const User = require('../models/user');
const Client = require('../models/client');
const Order = require('../models/order');
const Product = require('../models/product');
const Harvesting = require('../models/picking');
const Purchasing = require('../models/purchasing');
const Bag = require('../models/bag');

// model helpers
const dateHelper = require('../models/helpers/dates');
const deliveryHelper = require('../models/helpers/delivery');
const reportHelper = require('../models/helpers/report');

/* 
 * Handy route redicrections
*/

router.get('/clients', function(req, res) {
    res.redirect('/api/reports/clients/summary');
});

router.get('/orders', function(req, res) {
    res.redirect('/api/reports/orders/expecting-delivery');
});

router.get('/products', function(req, res) {
    res.redirect('/api/reports/products/summary');
});

router.get('/sales', function(req, res) {
    res.redirect('/api/reports/sales/summary');
});

/* 
 * Reports' routes
*/

router.get('/clients/summary', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            Client.listClients(function(err, clients) {
                if (err) throw err;
                reportHelper.countClients(function(cErr, totalNum) {
                    if (cErr) throw cErr;
                    res.render('reports/clients/index', { layout: 'layout_staff.handlebars', 
                    page_title: 'Clients summary', reportsLink: true,
                    user: req.user, clients: clients, totalNum: totalNum });
                })
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

router.get('/orders/expecting-delivery', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
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

            reportHelper.findPendingOrders(criteria, function(err, pendingOrders) {
                if (err) throw err;
                res.render('reports/clients/pendingOrders', { layout: 'layout_staff.handlebars', 
                page_title: 'Clients expecting deliveries', reportsLink: true, 
                user: req.user, pendingOrders: pendingOrders, criteria: criteria});
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

router.get('/products/summary', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
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
            
            var productList = [];
            Product.listProducts(function(err, products) {
                if (err) throw err;
                var prodCount = products.length;
                products.forEach(product => {
                    var harvestSum = 0;
                    var purchaseSum = 0;
                    var soldSum = 0;

                    Harvesting.listHarvests(product._id, criteria, function(harvErr, harvests) {
                        if (harvErr) throw harvErr;
                        Purchasing.listPurchases(product._id, criteria, function(purchErr, purchases) {
                            if (purchErr) throw purchErr;
                            reportHelper.listBagsByProduct(product, criteria, function(bagErr, bags) {
                                if (bagErr) throw bagErr;
                                // get all orders for the period, not just the count!
                                reportHelper.countOrdersForPeriod(criteria, function(ordErr, ordCount) {
                                    if (ordErr) throw ordErr;
                                    var harvCount = harvests.length;
                                    var purchCount = purchases.length;
                                    var bagCount = bags.length;

                                    harvests.forEach(harvest => {
                                        harvestSum += harvest.amountHarvested;
                                        harvCount--;
                                    });

                                    purchases.forEach(purchase => {
                                        purchaseSum += purchase.amountPurchased;
                                        purchCount--;
                                    });
                                    
                                    bags.forEach(bag => {
                                        // check if bag date equals order date
                                        soldSum += product.amountSmall + product.amountMedium + product.amountLarge;
                                        bagCount--;
                                    });

                                    if (harvCount == 0 && purchCount == 0 && bagCount == 0) {
                                        const prodObj = {
                                            product: product,
                                            harvestSum: harvestSum,
                                            purchaseSum: purchaseSum,
                                            soldSum: soldSum
                                        }
                                        productList.push(prodObj);
                                        prodCount--;
                                    }

                                    if (prodCount == 0) {
                                        res.render('reports/products/index', { layout: 'layout_staff.handlebars', 
                                        page_title: 'Products summary', reportsLink: true,
                                        user: req.user, products: productList, criteria: criteria });
                                    }
                                });
                            });
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

router.get('/sales/summary', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
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

            res.render('reports/sales/index', { layout: 'layout_staff.handlebars', 
            page_title: 'Sales summary', reportsLink: true,
            user: req.user, criteria: criteria });
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