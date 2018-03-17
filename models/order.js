const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// helpers
const _ = require('lodash');
const dateFormat = require('dateformat');
const dateHelper = require('./helpers/dates');

// related schemas
const Client = require('./client');
const Product = require('./product');

mongoose.Promise = global.Promise;

const OrderSchema = new Schema({
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client'
    },
    depositPaid: {
        type: Boolean
    },
    notes: {
        type: String
    },
    date: {
        type: Date
    },
    numberOfBags: {
        type: Number
    },
    typeOfBag: {
        //type of bag ordered
        type: String
    },
    delivered: {
        type: Boolean,
        default: false
    },
    cancelled: {
        type: Boolean,
        default: false
    },
    extra: [{
        //list of fruit in the bag
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }]
});

OrderSchema.pre('remove', function(next) {
    this.model('Order').remove({client: this._id}, next);
});

OrderSchema.virtual('formatDate').get(function() {
    var result = dateFormat(this.date, 'ddd, mmmm dd yyyy');
    return result;
});

OrderSchema.virtual('editDate').get(function() {
    var result = dateFormat(this.date, 'mm-dd-yyyy');
    return result;
});

OrderSchema.virtual('status').get(function() {
    var result;
    
    if (this.cancelled)
        result = "Cancelled"
    else if (this.delivered)
        result = "Delivered"
    else
        result = "Pending"
    
    return result;
});

const Order = module.exports = mongoose.model('Order', OrderSchema);

module.exports.listOrders = function(_id, criteria, callback) {
    Client.findById({_id})
    .then((client)=> {
        if (!_.isEmpty(criteria)) {
            Order.find({client: client, date: dateHelper.dateRangedSearch(criteria)})
            .populate({path: 'client'})
            .exec(callback);
        }
        else {
            Order.find({client: client})
            .populate({path: 'client'})
            .exec(callback);;
        }
    });
}

module.exports.createOrder = function(_id, orderDetails, extrasList, callback) {
    var order = new Order(orderDetails);
    var count = extrasList.length;
    
    Client.findById({_id})
    .then((client) => {
        order.client = client;
        if (count == 0) {
            return order.save(callback);
        }
        else {
            extrasList.forEach(productId => {
                Product.findById({_id: productId}, function(err, product) {
                    order.extra.push(product);
                    count--;
                    // save the data
                    if (count == 0)
                        return order.save(callback);
                });
            });
        }
    });
}

module.exports.updateOrder = function(_id, orderDetails, extrasList, callback) {
    var count = extrasList.length;
    
    Order.findById({_id})
    .then((order) => {
        order.extra = [];
        if (count == 0) {
            order.save();
            return Order.update({_id}, orderDetails, callback);
        }
        else {
            extrasList.forEach(productId => {
                Product.findById({_id: productId}, function(err, product) {
                    order.extra.push(product);
                    count--;
                    // save the data
                    if (count == 0) {
                        order.save();
                        return Order.update({_id}, orderDetails, callback);
                    }
                });
            });
        }
    });
}

module.exports.removeOrder = function(_id, callback) {
    Order.remove({_id}, callback);
}