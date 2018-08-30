// related schemas
const Picking = require('../picking');
const Purchasing = require('../purchasing');
const Order = require('../order');

module.exports.getLastHarvest = function(product, callback) {
    Picking.findOne({product: product})
    .sort({date: -1})
    .exec(callback)
}

module.exports.getLastPurchase = function(product, callback) {
    Purchasing.findOne({product: product})
    .sort({date: -1})
    .exec(callback)
}

module.exports.getLastOrder = function(client, callback) {
    Order.findOne({client: client})
    .sort({date: -1})
    .exec(callback)
}