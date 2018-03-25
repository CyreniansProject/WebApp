const Order = require('../order');
const Product = require('../product');
const Harvesting = require('../picking');
const Purchasing = require('../purchasing');
const Bag = require('../bag');

// helpers
const _ = require('lodash');

module.exports.findTodaysOrders = function(today, callback) {
    Order.find({date: today}).exec(callback);
}