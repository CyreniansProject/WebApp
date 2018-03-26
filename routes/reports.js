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
                    page_title: 'Clients summary', user: req.user, reportsLink: true, 
                    clients: clients, totalNum: totalNum });
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
                page_title: 'Clients expecting deliveries', user: req.user, 
                pendingOrders: pendingOrders, criteria: criteria, reportsLink: true, 
                showOrdersReport: true });
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
                                    totalProductSum = (totalHarvestSum + totalPurchaseSum) - totalSoldSum;

                                    if (prodCount == 0) {
                                        const totals = {
                                            productSum: totalProductSum,
                                            harvestSum: totalHarvestSum,
                                            purchaseSum: totalPurchaseSum,
                                            soldSum: totalSoldSum
                                        };
                                        res.render('reports/products/index', { layout: 'layout_staff.handlebars', 
                                        page_title: 'Products summary', user: req.user, 
                                        products: productList, totals: totals, criteria: criteria, 
                                        reportsLink: true, showProductsReport: true });
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
            const startMonth = req.query['startMonth'];
            const year = req.query['year'];

            var criteria;
            var criterias = [];
            var months = [];
            var saleList = [];
            if (!startMonth && !year) {
                req.flash("Select yearly or monthly from the list provided and type a valid year.");
                return res.redirect('back');
            }

            if (startMonth && startMonth !== "12m") {
                const startDate = new Date(startMonth + '-' + 1 + '-' + year);
                const int_endDate = new Date(year, startMonth, 1);
                const endDate = new Date(int_endDate - 1);
                
                criteria = {
                    startDate: startDate,
                    endDate: endDate,
                }

                const month = startMonth;
                reportHelper.findBagsByOrderDate({}, function(bagErr, bags) {
                    if (bagErr) throw bagErr;
                    reportHelper.findDeliveredOrders(criteria, function(ordErr, orders) {
                        if (ordErr) throw ordErr;
                        var bagCount = bags.length;
                        var ordCount = orders.length;
                        var sumSmall = 0;
                        var sumMed = 0;
                        var sumLarge = 0;
                        var sumProfit = 0;
                        var sumExpense = 0;
                        var sumRevenue = 0;

                        if (ordCount == 0) {
                            return res.render('reports/sales/index', { layout: 'layout_staff.handlebars', 
                            page_title: 'Sales summary', user: req.user, criteria: criteria,
                            reportsLink: true, showSalesReport: true });
                        }

                        Purchasing.find({date: dateHelper.dateRangedSearch(criteria)}, 
                        function(purchErr, purchases) {
                            if (purchErr) throw purchErr;
                            var purchCount = purchases.length;
                            purchases.forEach(purchase => {
                                sumExpense += purchase.amountPurchased * purchase.price;
                                purchCount--;
                            });
                            if (purchCount == 0) {
                                bags.forEach(bag =>{
                                    orders.forEach(order=>{
                                        if(order.date >= bag.startDate && order.date < bag.endDate && order.delivered && !order.cancelled 
                                        && order.typeOfBag == bag.type) {
                                            if(bag.type == 'Small'){
                                                sumSmall = sumSmall + order.numberOfBags;
                                                sumProfit += order.numberOfBags * bag.price;
                                            }
                                            else if(bag.type == 'Medium'){
                                                sumMed = sumMed + order.numberOfBags;
                                                sumProfit += order.numberOfBags * bag.price;
                                            }
                                            else if(bag.type == 'Large'){
                                                sumLarge = sumLarge + order.numberOfBags;
                                                sumProfit += order.numberOfBags * bag.price;
                                            }
                                        }
                                    });
                                    bagCount--;
                                    if (bagCount == 0) {
                                        var monthToStr;
                                        if (month == 1) { monthToStr = "January"; }
                                        else if (month == 2) { monthToStr = "February"; }
                                        else if (month == 3) { monthToStr = "March"; }
                                        else if (month == 4) { monthToStr = "April"; }
                                        else if (month == 5) { monthToStr = "May"; }
                                        else if (month == 6) { monthToStr = "June"; }
                                        else if (month == 7) { monthToStr = "July"; }
                                        else if (month == 8) { monthToStr = "August"; }
                                        else if (month == 9) { monthToStr = "September"; }
                                        else if (month == 10) { monthToStr = "October"; }
                                        else if (month == 11) { monthToStr = "November"; }
                                        else if (month == 12) { monthToStr = "December"; }
                                        const saleObj = {
                                            monthId: month,
                                            month: monthToStr,
                                            sumSmall: sumSmall,
                                            sumMed: sumMed,
                                            sumLarge: sumLarge,
                                            sumProfit: sumProfit,
                                            sumExpense: sumExpense,
                                            sumRevenue: sumProfit - sumExpense
                                        }
                                        res.render('reports/sales/index', { layout: 'layout_staff.handlebars', 
                                        page_title: 'Sales summary', user: req.user, 
                                        sales: saleObj, criteria: criteria, 
                                        reportsLink: true, showSalesReport: true });
                                    }
                                });
                            }
                        });
                    });
                });
            }
            else {
                months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
                monthCount = months.length;
                var startDate, int_endDate, endDate;
                months.forEach(month => {
                    startDate = new Date(month + '-' + 1 + '-' + year);
                    int_endDate = new Date(year, month, 1);
                    endDate = new Date(int_endDate - 1);
                    const criteriaObj = {
                        startDate: startDate,
                        endDate: endDate,
                    }
                    criterias.push(criteriaObj);
                    monthCount--;
                    if (monthCount == 0) {
                        var critCount = criterias.length;
                        var month;
                        criterias.forEach(criteria => {
                            var saleObj;
                            reportHelper.findBagsByOrderDate({}, function(bagErr, bags) {
                                if (bagErr) throw bagErr;
                                reportHelper.findDeliveredOrders(criteria, function(ordErr, orders) {
                                    if (ordErr) throw ordErr;
                                    var bagCount = bags.length;
                                    var ordCount = orders.length;
                                    var sumSmall = 0;
                                    var sumMed = 0;
                                    var sumLarge = 0;
                                    var sumProfit = 0;
                                    var sumExpense = 0;
                                    var sumRevenue = 0;
                                    
                                    var purchCount = 0;
                                    Purchasing.find({date: dateHelper.dateRangedSearch(criteria)}, 
                                    function(purchErr, purchases) {
                                        if (purchErr) throw purchErr;
                                        purchCount = purchases.length;
                                        purchases.forEach(purchase => {
                                            sumExpense += purchase.amountPurchased * purchase.price;
                                            purchCount--;
                                        });
                                    }).then(() => {
                                    if (purchCount == 0) {
                                        month = new Date(criteria.startDate).getMonth() + 1;
                                        bags.forEach(bag => {
                                            orders.forEach(order=> {
                                                if(order.date >= bag.startDate && order.date < bag.endDate 
                                                && order.delivered && !order.cancelled 
                                                && order.typeOfBag == bag.type) {
                                                    if(bag.type == 'Small'){
                                                        sumSmall = sumSmall + order.numberOfBags;
                                                        sumProfit += order.numberOfBags * bag.price;
                                                    }
                                                    else if(bag.type == 'Medium') {
                                                        sumMed = sumMed + order.numberOfBags;
                                                        sumProfit += order.numberOfBags * bag.price;
                                                    }
                                                    else if(bag.type == 'Large') {
                                                        sumLarge = sumLarge + order.numberOfBags;
                                                        sumProfit += order.numberOfBags * bag.price;
                                                    }
                                                }
                                            });
                                            bagCount--;
                                        });
                                        if (bagCount == 0) {
                                            var monthToStr;
                                            if (month == 1) { monthToStr = "January"; }
                                            else if (month == 2) { monthToStr = "February"; }
                                            else if (month == 3) { monthToStr = "March"; }
                                            else if (month == 4) { monthToStr = "April"; }
                                            else if (month == 5) { monthToStr = "May"; }
                                            else if (month == 6) { monthToStr = "June"; }
                                            else if (month == 7) { monthToStr = "July"; }
                                            else if (month == 8) { monthToStr = "August"; }
                                            else if (month == 9) { monthToStr = "September"; }
                                            else if (month == 10) { monthToStr = "October"; }
                                            else if (month == 11) { monthToStr = "November"; }
                                            else if (month == 12) { monthToStr = "December"; }
                                            saleObj = {
                                                monthId: month,
                                                month: monthToStr,
                                                sumSmall: sumSmall,
                                                sumMed: sumMed,
                                                sumLarge: sumLarge,
                                                sumProfit: sumProfit,
                                                sumExpense: sumExpense,
                                                sumRevenue: sumProfit - sumExpense
                                            }
                                            saleList.push(saleObj);
                                            critCount--;
                                        }
                                        if (critCount == 0) {
                                            saleList.sort(function(a, b){
                                                if(a.monthId < b.monthId) return -1;
                                                if(a.monthId > b.monthId) return 1;
                                                return 0;
                                            });
                                            res.render('reports/sales/index', { layout: 'layout_staff.handlebars', 
                                            page_title: 'Sales summary', user: req.user, 
                                            sales: saleObj, salesList: saleList, criteria: criteria, 
                                            reportsLink: true, showSalesReport: true });
                                        }
                                    }
                                    });
                                });
                            });
                        });
                    }
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