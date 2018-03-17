const express = require('express');
var router = express.Router();
const flash = require('connect-flash');

const Order = require('../models/order');
const Client = require('../models/client');
const Product = require('../models/product');
const Bag = require('../models/bag');

router.get('/to/:clientId', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const clientId = req.params.clientId;
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

            Order.listOrders(clientId, criteria, function(err, orders) {
                if (err) throw err;
                Client.findOne({_id: clientId}, function(cErr, client) {
                    if (cErr) throw cErr;
                    res.render('orders/index', { layout: 'layout_staff.handlebars', page_title: 'Orders list for ' + client.name, 
                    user: req.user, orders: orders, clientId: clientId });
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

router.get('/to/:clientId/new', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const clientId = req.params.clientId;
            Client.findById({_id: clientId}, function(err, client) {
                if (err) throw err;

                Product.listProducts(function(prodErr, products) {
                    if (prodErr) throw prodErr;

                    res.render('orders/addOrder', { layout: 'layout_staff.handlebars', page_title: 'New order for ' + client.name, 
                    products: products, user: req.user, clientId: clientId});
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

router.post('/new', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const clientId = req.body.clientId;
            
            var products;
            try {
                const o = JSON.parse(req.body.products);
                if (o && typeof o === "object")
                    products = o;
            }
            catch (e) {
                products = [];
            }

            const numberOfBags = req.body.numberOfBags;
            const typeOfBag = req.body.typeOfBag;
            const notes = req.body.notes;
            const date = req.body.date;
            const depositPaid = req.body.depositPaid;

            // Validation
            req.check('numberOfBags', 'Bags (number) is required').notEmpty();
            req.check('typeOfBag', 'Bag size (selection) is required').not().equals("Choose...");
            req.check('date', 'Date (selection) is required').notEmpty();
            req.check('depositPaid', 'Deposit (selection) is required').notEmpty();

            // Store validation errors if any...
            var validErrors = req.validationErrors();
 
            // Attempt User creation
            if (validErrors) {
                req.flash('valid_msg', validErrors[0].msg);
                return res.redirect('back');
            }
            else {
                var extrasList = [];
                if (products.length > 0) {
                    products.forEach(product => {
                        extrasList.push(product);
                    });
                }

                const orderDetails = {
                    depositPaid: depositPaid,
                    notes: notes,
                    date: date,
                    numberOfBags: numberOfBags,
                    typeOfBag: typeOfBag
                };

                Order.createOrder(clientId, orderDetails, extrasList, function(err, order) {
                    if (err) throw err;
                    req.flash('success_msg', 'Order successfully added!');
                    return res.redirect('/api/orders/to/' + clientId);
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

            Order.findById({_id: id}, function(err, order) {
                if (err) throw err;

                order.populate({path: 'client'}).populate({path: 'extra'}, function(cpErr) {
                    if (cpErr) throw cpErr;
                    Product.listProducts(function(lpErr, products) {
                        if (lpErr) throw lpErr;
                            res.render('orders/editOrder', { layout: 'layout_staff.handlebars', 
                            page_title: 'Edit order for ' + order.client.name, 
                            user: req.user, order: order, products: products,
                            depositPaid: order.depositPaid});
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
            const orderId = req.body.orderId;

            var products;
            if (req.body.products.length > 0)
                products = JSON.parse(req.body.products);
            else
                products = []
            
            const numberOfBags = req.body.numberOfBags;
            const typeOfBag = req.body.typeOfBag;
            const notes = req.body.notes;
            const date = req.body.date;
            const depositPaid = req.body.depositPaid;
            const status = req.body.deliveryStatus;

            // Validation
            req.check('numberOfBags', 'Bags (number) is required').notEmpty();
            req.check('typeOfBag', 'Bag size (selection) is required').not().equals("Choose...");
            req.check('date', 'Date (selection) is required').notEmpty();
            req.check('depositPaid', 'Deposit (selection) is required').notEmpty();
            req.check('deliveryStatus', 'Delivery status (selection) is required').not().equals("Choose...");
            // Store validation errors if any...
            var validErrors = req.validationErrors();
    
            // Attempt User creation
            if (validErrors) {
                req.flash('valid_msg', validErrors[0].msg);
                return res.redirect('back');
            }
            else {
                var extrasList = [];
                if (products.length > 0) {
                    products.forEach(product => {
                        extrasList.push(product);
                    });
                }

                var delivered, cancelled;
                if (status == "Pending") { 
                    delivered = false;
                    cancelled = false;
                }
                else if (status == "Delivered") {
                    delivered = true;
                    cancelled = false;
                }
                else if (status == "Cancelled") {
                    delivered = false;
                    cancelled = true;
                }
            
                const orderDetails = {
                    depositPaid: depositPaid,
                    notes: notes,
                    date: date,
                    numberOfBags: numberOfBags,
                    typeOfBag: typeOfBag,
                    delivered: delivered,
                    cancelled: cancelled
                };

                Order.updateOrder(orderId, orderDetails, extrasList, function(err, order) {
                    if (err) throw err;
                    req.flash('success_msg', 'Order successfully updated!');
                    return res.redirect('back');
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
    const orderId = req.params.id;

    Order.removeOrder(orderId, function(err) {
        if (err) throw err;
        req.flash('success_msg', 'Order successfully removed!');
        res.redirect('back');
    });
});

module.exports = router;