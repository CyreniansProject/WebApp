const Order = require('../order');
const Client = require('../client');
const Bag = require('../bag');

// helpers
const _ = require('lodash');
const dateHelper = require('./dates');

module.exports.countClients = function(callback) {
    Client.count({}).exec(callback);
}

module.exports.countOrdersForPeriod = function(criteria, callback) {
    if (!_.isEmpty(criteria)) {
        Order.count({date: dateHelper.dateRangedSearch(criteria)})
        .exec(callback);
    }
    else {
        Order.count({})
        .exec(callback);
    }
}

module.exports.findPendingOrders = function(criteria, callback) {
    if (!_.isEmpty(criteria)) {
        Order.find({date: dateHelper.dateRangedSearch(criteria), delivered: false, cancelled: false})
        .populate({path: 'client'})
        .sort('client.address')
        .exec(callback);
    }
    else {
        Order.find({delivered: false, cancelled: false})
        .populate({path: 'client'})
        .sort('client.address')
        .exec(callback);
    }
}

module.exports.listBagsByProduct = function(product, criteria, callback) {
    if (!_.isEmpty(criteria)) {
        Bag.find({product: product, startDate: dateHelper.dateRangedSearch(criteria)})
        .populate({path: 'product'})
        .exec(callback);
    }
    else {
        Bag.find({product: product})
        .populate({path: 'product'})
        .exec(callback);
    }
}