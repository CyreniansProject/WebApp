var express = require('express');
var router = express.Router();

// helpers
const _ = require('lodash');
const deliveryHelper = require('../models/helpers/delivery');

// Driver landing - GET
router.get('/', function(req, res) {
    res.redirect('/api/driver/pending');
});

// Driver pending - GET
router.get('/pending', function(req, res) {
    if (req.user) {
        if (req.user.role == 2) {
            var addresses = [];
            var deliveries = [];

            var count = 0;
            deliveryHelper.findAdresses(function(addrErr, addresses) {
                if (addrErr) throw addrErr;
                deliveryHelper.findPendingOrders(function(ordErr, orders) {
                    if (ordErr) throw ordErr;
                    addresses.forEach(address => {
                        var tempOrders = [];
                        orders.forEach(order => {
                            if (address == order.client.address) {
                                tempOrders.push(order);
                            }
                        });
                        
                        count++;
                        
                        const delivery = {
                            id: (count == 0) ? 1 : count,
                            address: address,
                            orders: tempOrders
                        }
                        
                        if (!_.isEmpty(delivery.orders)) {
                            deliveries.push(delivery)
                        }
                    });

                    // display the driver pending dashboard view
                    res.render('driver/pending', { layout: 'layout_staff.handlebars', page_title: '', delivery_title: 'Pending',
                    pending_deliveries: deliveries, user: req.user});
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

// Driver pending - GET
router.get('/completed', function(req, res) {
    if (req.user) {
        if (req.user.role == 2) {
            var addresses = [];
            var deliveries = [];

            var count = 0;
            deliveryHelper.findAdresses(function(addrErr, addresses) {
                if (addrErr) throw addrErr;
                deliveryHelper.findCompletedOrders(function(ordErr, orders) {
                    if (ordErr) throw ordErr;
                    addresses.forEach(address => {
                        var tempOrders = [];
                        orders.forEach(order => {
                            if (address == order.client.address) {
                                tempOrders.push(order);
                            }
                        });
                                                
                        if (!_.isEmpty(tempOrders)) {
                            
                            count++;

                            const delivery = {
                                id: (count == 0) ? 1 : count,
                                address: address,
                                orders: tempOrders
                            }
                            
                            deliveries.push(delivery)
                        }
                    });

                    // display the driver completed dashboard view
                    res.render('driver/completed', { layout: 'layout_staff.handlebars', page_title: '', delivery_title: 'Completed',
                    completed_deliveries: deliveries, user: req.user});
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

router.post('/complete', function(req, res) {
    if (req.user) {
        if (req.user.role == 2) {
            const id = req.body.deliveryId;
            const deliveries = JSON.parse(req.body.deliveries);
            
            var ordersDetails = [];
            deliveries.forEach(delivery => {
                if (delivery.id == id) {
                    ordersDetails.push(delivery.order);
                }
            });
            
            count = ordersDetails.length;
            ordersDetails.forEach(orderDetails => {
                deliveryHelper.updateOrderStatus(orderDetails, function(err, order) {
                    if (err) throw err;
                    count--;

                    if (count == 0) {
                        res.redirect('/api/driver/pending');
                    }
                });
            })
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
})

module.exports = router;