const express = require('express');
var router = express.Router();
const flash = require('connect-flash');

const Order = require('../models/order');
const Client = require('../models/client');

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
                res.render('orders/addOrder', { layout: 'layout_staff.handlebars', page_title: 'New order for ' + client.name, 
                user: req.user, clientId: clientId});
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
            
            const depositPaid = req.body.depositPaid;
            const notes = req.body.notes;
            const date = req.body.date;
            const numberOfBags = req.body.numberOfBags;

            // VALIDATION ... TODO

            const orderDetails = {
                depositPaid: depositPaid,
                notes: notes,
                date: date,
                numberOfBags: numberOfBags,
            };

            Order.createOrder(clientId, orderDetails, function(err, order) {
                if (err) throw err;
                req.flash('success_msg', 'Order successfully added!');
                res.redirect('/api/orders/to/' + clientId);
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
                order.populate({
                    path:'client'
                }, function(err) {
                    if (err) throw err;
                    res.render('orders/editOrder', { layout: 'layout_staff.handlebars', page_title: 'Edit order for ' + order.client.name, 
                    user: req.user, order: order, depositPaid: order.depositPaid });
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
            
            const depositPaid = req.body.depositPaid;
            const notes = req.body.notes;
            const date = req.body.date;
            const numberOfBags = req.body.numberOfBags;

            // VALIDATION ... TODO

            const orderDetails = {
                depositPaid: depositPaid,
                notes: notes,
                date: date,
                numberOfBags: numberOfBags,
            };

            Order.updateOrder(orderId, orderDetails, function(err, order) {
                if (err) throw err;
                req.flash('success_msg', 'Order successfully updated!');
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

router.get('/remove/:id', function(req, res) {
    const orderId = req.params.id;

    Order.removeOrder(orderId, function(err) {
        if (err) throw err;
        req.flash('success_msg', 'Order successfully removed!');
        res.redirect('back');
    });
});

module.exports = router;