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

router.get('/orders/expecting-delivery', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            res.render('reports/clients/pendingOrders', { layout: 'layout_staff.handlebars', 
                page_title: 'Clients expecting deliveries', reportsLink: true, 
                user: req.user, showOrdersReport: false});
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
            res.render('reports/products/index', { layout: 'layout_staff.handlebars', 
            page_title: 'Products summary', reportsLink: true,
            user: req.user, showProductsReport: false });
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
            res.render('reports/sales/index', { layout: 'layout_staff.handlebars', 
            page_title: 'Sales summary', reportsLink: true,
            user: req.user, showSalesReport: false });
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

router.get('/orders/expecting-delivery/generate', function(req, res) {
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

            if (_.isEmpty(criteria)) {
                req.flash('error_msg', 'Please select a date range or at least just a FROM or TO date!');
                return res.redirect('back');
            }

            reportHelper.findPendingOrders(criteria, function(err, pendingOrders) {
                if (err) throw err;
                res.render('reports/clients/pendingOrders', { layout: 'layout_staff.handlebars', 
                page_title: 'Clients expecting deliveries', reportsLink: true, 
                user: req.user, pendingOrders: pendingOrders, criteria: criteria, showOrdersReport: true });
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

router.get('/products/summary/generate', function(req, res) {
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

            if (_.isEmpty(criteria)) {
                req.flash('error_msg', 'Please select a date range or at least just a FROM or TO date!');
                return res.redirect('back');
            }
            
            var productList = [];

            Product.listProducts(function(err, products) {
                if (err) throw err;
                var prodCount = products.length;
                
                var totalProductSum = 0;
                var totalHarvestSum = 0;
                var totalPurchaseSum = 0;
                var totalSoldSum = 0;

                products.forEach(product => {
                    var productSum = 0;
                    var harvestSum = 0;
                    var purchaseSum = 0;
                    var soldSum = 0;
                    
                    Harvesting.listHarvests(product._id, criteria, function(harvErr, harvests) {
                        if (harvErr) throw harvErr;
                        Purchasing.listPurchases(product._id, criteria, function(purchErr, purchases) {
                            if (purchErr) throw purchErr;
                            reportHelper.findDeliveredOrders(criteria, function(ordErr, orders) {
                                if (ordErr) throw ordErr;
                                reportHelper.findBagsByOrderDate(criteria, function(bagErr, bags) {
                                    if (bagErr) throw bagErr;
                                    var harvCount = harvests.length;
                                    var purchCount = purchases.length;
                                    var ordCount = orders.length;
                                    var bagCount = bags.length;

                                    harvests.forEach(harvest => {
                                        harvestSum += harvest.amountHarvested * product.avgWeight;
                                        harvCount--;
                                    });

                                    purchases.forEach(purchase => {
                                        purchaseSum += purchase.amountPurchased * product.avgWeight;
                                        purchCount--;
                                    });
                                    
                                    if (harvCount == 0 && purchCount == 0) {
                                        if (ordCount == 0) {;
                                            const prodObj = {
                                                product: product,
                                                harvestSum: harvestSum,
                                                purchaseSum: purchaseSum,
                                                soldSum: soldSum
                                            }
                                            productList.push(prodObj);
                                            prodCount--;
                                        }
                                        else {
                                            orders.forEach(order => {
                                                bags.forEach(bag => {
                                                    if (order.date >= bag.startDate && order.date < bag.endDate 
                                                    && order.delivered && !order.cancelled && bag.type == order.typeOfBag) {
                                                        var localExtraSum = 0;
                                                        if (order.extra.length > 0) {
                                                            order.extra.forEach(xtra => {
                                                                if (xtra.name == product.name) {
                                                                    soldSum += xtra.avgWeight;
                                                                }
                                                            });
                                                        }
                                                        
                                                        bag.product.forEach(productInBag => {
                                                            if (productInBag.name == product.name) {
                                                                soldSum += order.numberOfBags * product.avgWeight;
                                                            }
                                                        });
                                                    }
                                                });
                                                ordCount--;
                                                if (ordCount == 0) {
                                                    const prodObj = {
                                                        product: product,
                                                        harvestSum: harvestSum,
                                                        purchaseSum: purchaseSum,
                                                        soldSum: soldSum
                                                    }
                                                    productList.push(prodObj);
                                                    prodCount--;
                                                }
                                            });
                                        }
                                    }

                                    // total sums
                                    totalHarvestSum += harvestSum;
                                    totalPurchaseSum += purchaseSum;
                                    totalSoldSum += soldSum;
                                    totalProductSum = totalHarvestSum + totalPurchaseSum;

                                    if (prodCount == 0) {

                                        const totals = {
                                            productSum: totalProductSum,
                                            harvestSum: totalHarvestSum,
                                            purchaseSum: totalPurchaseSum,
                                            soldSum: totalSoldSum
                                        };

                                        res.render('reports/products/index', { layout: 'layout_staff.handlebars', 
                                        page_title: 'Products summary', reportsLink: true,
                                        user: req.user, products: productList, totals: totals,
                                        criteria: criteria, showProductsReport: true });
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

router.get('/sales/summary/generate', function(req, res) {
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

            if (_.isEmpty(criteria)) {
                req.flash('error_msg', 'Please select a date range or at least just a FROM or TO date!');
                return res.redirect('back');
            }

            res.render('reports/sales/index', { layout: 'layout_staff.handlebars', 
            page_title: 'Sales summary', reportsLink: true,
            user: req.user, criteria: criteria, showSalesReport: true });
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