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

router.get('/:clientId', function(req, res) {
    const clientId = req.params.clientId;
    Order.fetchOrders(clientId, function(err, orders) {
        if (err) throw err;
        res.json({orderList: orders});
    });
});

router.post('/new', function(req, res) {
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
        res.json(order);
    });
});

router.post('/update', function(req, res) {
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
        res.json(order);
    });
});

router.post('/remove', function(req, res) {
    const orderId = req.body.orderId;

    Order.removeOrder(orderId, function(err) {
        if (err) throw err;
        res.json("The order was removed successfully!");
    });
});

module.exports = router;