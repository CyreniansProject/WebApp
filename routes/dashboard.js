const express = require('express');
var router = express.Router();

// models / schemas
const Order = require('../models/order');
const Product = require('../models/product');
const Harvesting = require('../models/picking');
const Purchasing = require('../models/purchasing');
const Bag = require('../models/bag');

// model helpers
const dashboardHelper = require('../models/helpers/dashboard');
const reportHelper = require('../models/helpers/report');

// utility helpers
const _ = require('lodash');
const flash = require('connect-flash');

router.get('/', function(req, res) {
    if (req.user) {
        if (req.user.role == 2) {
            res.redirect('/api/driver');
        }
        else {
            var pending = 0;
            var delivered = 0;
            var cancelled = 0;

            var today = new Date();
            today.setHours(0, 0, 0, 0);

            const criteria = {
                startDate: today,
                endDate: today
            }

            dashboardHelper.findTodaysOrders(today, function(err, todaysOrders) {
                if (err) throw err;
                var todayOrdCount = todaysOrders.length;
                todaysOrders.forEach(order => {
                    if (!order.delivered && !order.cancelled) {
                        pending++;
                    }
                    else if (order.delivered && !order.cancelled) {
                        delivered++;
                    }
                    else if (!order.delivered && order.cancelled) {
                        cancelled++;
                    }
                    todayOrdCount--;
                });

                if (todayOrdCount == 0) {
                    const ordersObj = {
                        pending: pending,
                        delivered: delivered,
                        cancelled: cancelled,
                        totalNum: pending + delivered + cancelled
                    }

                    Product.listProducts(function(err, products) {
                        if (err) throw err;
                        var prodCount = products.length;
                        
                        var totalHarvestSum = 0;
                        var totalPurchaseSum = 0;
                        var totalSoldSum = 0;
                        var totalProfitSum = 0;

                        products.forEach(product => {
                            var harvestSum = 0;
                            var purchaseSum = 0;
                            var soldSum = 0;
                            var profitSum = 0;

                            Harvesting.listHarvests(product._id, criteria, function(harvErr, harvests) {
                                if (harvErr) throw harvErr;
                                Purchasing.listPurchases(product._id, criteria, function(purchErr, purchases) {
                                    if (purchErr) throw purchErr;
                                    reportHelper.findDeliveredOrders(criteria, function(ordErr, orders) {
                                        if (ordErr) throw ordErr;
                                        reportHelper.findBagsByOrderDate({}, function(bagErr, bags) {
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
                                                if (ordCount == 0) {
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

                                                                // sum revenue
                                                                profitSum += order.numberOfBags * bag.price;
                                                            }
                                                        });
                                                        ordCount--;
                                                        if (ordCount == 0) {
                                                            prodCount--;
                                                        }
                                                    });
                                                }
                                            }
        
                                            // total sums
                                            totalHarvestSum += harvestSum;
                                            totalPurchaseSum += purchaseSum;
                                            totalSoldSum += soldSum;
                                            totalProfitSum = profitSum;
                                            
                                            if (prodCount == 0) {
                                                
                                                const totals = {
                                                    harvestSum: totalHarvestSum,
                                                    purchaseSum: totalPurchaseSum,
                                                    soldSum: totalSoldSum,
                                                    profitSum: totalProfitSum
                                                };

                                                res.render('dashboard', { layout: 'layout_staff.handlebars', page_title: 'Dashboard - daily overview', 
                                                user: req.user, orders: ordersObj, totals: totals });
                                            }
                                        });
                                    });
                                });
                            });
                        });
                    });
                }
            });
        }
    }
    else {
        req.flash('error_msg', 'You need to login first!');
        res.redirect('/');
    }
});

module.exports = router;