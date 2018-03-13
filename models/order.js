const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Client = require('./client');
const Product = require('./product');

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
        type: String
    },
    numberOfBags: {
        type: Number
    },
    typeOfBag: {
        //type of bag ordered
        type: String
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

const Order = module.exports = mongoose.model('Order', OrderSchema);

module.exports.listOrders = function(_id, callback) {
    Client.findById({_id})
    .then((client) => {
        Order.find({client: client}, callback);
    });
}

module.exports.createOrder = function(_id, orderDetails, extrasList, callback) {
    var order = new Order(orderDetails);
    var count = extrasList.length;
    
    Client.findById({_id}, function(err, client) {
        order.client = client;
    })
    .then(() => {
        if (count == 0) {
            return order.save(orderDetails, callback);
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
            return order.save(orderDetails, callback);
        }
        else {
            extrasList.forEach(productId => {
                Product.findById({_id: productId}, function(err, product) {
                    order.extra.push(product);
                    count--;
                    // save the data
                    if (count == 0)
                        return order.save(orderDetails, callback);
                });
            });
        }
    });
}

module.exports.removeOrder = function(_id, callback) {
    Order.remove({_id}, callback);
}