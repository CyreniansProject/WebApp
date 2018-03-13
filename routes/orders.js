const express = require('express');
var router = express.Router();
const flash = require('connect-flash');

const Order = require('../models/order');
const Client = require('../models/client');
const Product = require('../models/product');
const Bag = require('../models/bag');

/** !!!
 ** THIS IS A BASE AND PURE API WITH NO FRONT-END CONNECTION ATM!

 ** NOTE: AFTER RECEIVING THE FRONT-END TEMPLATE,
 ** DO: if (req.user) { ... res.render(...) } else { res.flash(...) res.redirect(...) }
 ** WITH USER LEVEL RESTRICTIONS AS WELL WHERE APPLICABLE
!!! **/

router.get('/to/:clientId', function(req, res) {
    if (req.user) {
        if (req.user.role == 0 || req.user.role == 1) {
            const clientId = req.params.clientId;
            Order.listOrders(clientId, function(err, orders) {
                if (err) throw err;
                Client.findById({_id: clientId}, function(cErr, client) {
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

            const depositPaid = req.body.depositPaid;
            const notes = req.body.notes;
            const date = req.body.date;
            const numberOfBags = req.body.numberOfBags;

            // VALIDATION ... TODO

            // Validate order date: in the range of the activity of bag
            var foundValidBag = false;
            const orderDate = new Date(date);
            Bag.find({}, function(err, bagList) {
                if (err) return err;
                for (let i = bagList.length - 1; i >= 0; i--) {
                    const startDate = new Date(bagList[i].startDate);
                    const endDate = new Date(bagList[i].endDate);
                    if (startDate <= orderDate && endDate >= orderDate) foundValidBag = true;
                    else if (i == 0) {
                        req.flash('error_msg', 'Cannot proceed with the order. There is no valid bag set for the selected date.');
                        return res.redirect('back');
                    }
                }
            }).
            then(() => {
                if (foundValidBag) {
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
                    };

                    Order.createOrder(clientId, orderDetails, extrasList, function(err, order) {
                        if (err) throw err;
                        req.flash('success_msg', 'Order successfully added!');
                        res.redirect('/api/orders/to/' + clientId);
                    });
                }
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
                            depositPaid: order.depositPaid });
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
            
            const depositPaid = req.body.depositPaid;
            const notes = req.body.notes;
            const date = req.body.date;
            const numberOfBags = req.body.numberOfBags;

             // VALIDATION ... TODO

            // Validate order date: in the range of the activity of bag
            var foundValidBag = false;
            const orderDate = new Date(date);
            Bag.find({}, function(err, bagList) {
                if (err) return err;
                for (let i = bagList.length - 1; i >= 0; i--) {
                    const startDate = new Date(bagList[i].startDate);
                    const endDate = new Date(bagList[i].endDate);
                    if (startDate <= orderDate && endDate >= orderDate) foundValidBag = true;
                    else if (i == 0) {
                        req.flash('error_msg', 'Cannot proceed with the order. There is no valid bag set for the selected date.');
                        return res.redirect('back');
                    }
                }
            }).
            then(() => {
                if (foundValidBag) {
                    var extrasList = [];
                    if (products.length > 0) {
                        products.forEach(product => {
                            console.log(product);
                            extrasList.push(product);
                        });
                    }
                
                    const orderDetails = {
                        depositPaid: depositPaid,
                        notes: notes,
                        date: date,
                        numberOfBags: numberOfBags,
                    };

                    Order.updateOrder(orderId, orderDetails, extrasList, function(err, order) {
                        if (err) throw err;
                        req.flash('success_msg', 'Order successfully updated!');
                        res.redirect('back');
                    });
                }
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

router.get('/remove/:id', function(req, res) {
    const orderId = req.params.id;

    Order.removeOrder(orderId, function(err) {
        if (err) throw err;
        req.flash('success_msg', 'Order successfully removed!');
        res.redirect('back');
    });
});

module.exports = router;