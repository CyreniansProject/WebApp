const Order = require('../order');
const Client = require('../client');

module.exports.findAdresses = function(callback) {
    Client
    .find()
    .distinct('address')
    .exec(callback);
}

module.exports.findPendingOrders = function(callback) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    Order.find({date: today, delivered: false, cancelled: false})
    .populate({path: 'client'})
    .exec(callback);
}

module.exports.findCompletedOrders = function(callback) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    
    Order.find({date: today,
        "$or": [
            {"delivered": "true"},
            {"cancelled": "true"}
        ]
    })
    .populate({path: 'client'})
    .exec(callback);
}