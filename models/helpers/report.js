const Order = require('../order');
const Client = require('../client');
const Bag = require('../bag');

// helpers
const _ = require('lodash');
const dateHelper = require('./dates');

module.exports.countClients = function(callback) {
    Client.count({}).exec(callback);
}

module.exports.findPendingOrders = function(criteria, callback) {
    if (!_.isEmpty(criteria)) {
        Order.find({date: dateHelper.dateRangedSearch(criteria), delivered: false, cancelled: false})
        .sort('client.address')
        .populate({path: 'client'})
        .exec(callback);
    }
    else {
        Order.find({delivered: false, cancelled: false})
        .sort('client.address')
        .populate({path: 'client'})
        .exec(callback);
    }
}

module.exports.findDeliveredOrders = function(criteria, callback) {
    if (!_.isEmpty(criteria)) {
        Order.find({date: dateHelper.dateRangedSearch(criteria), delivered: true, cancelled: false})
        .populate({path: 'extra'})
        .exec(callback);
    }
    else {
        Order.find({delivered: false, cancelled: false})
        .populate({path: 'extra'})
        .exec(callback);
    }
}

module.exports.findBagsByOrderDate = function(criteria, callback) {
    if (!_.isEmpty(criteria)) {
        Bag.find({startDate: dateHelper.dateRangedSearch(criteria)})
        .populate({path: 'product'})
        .exec(callback);
    }
    else {
        Bag.find({})
        .populate({path: 'product'})
        .exec(callback);
    }
}