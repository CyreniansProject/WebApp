const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Client = require('./client');

mongoose.Promise = global.Promise;

const OrderSchema = new Schema({
    client: {
        type: Schema.Types.ObjectId, ref: 'Client'
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
    }
});

OrderSchema.pre('remove', function(next) {
    this.model('order').remove({ client: this._id }, next);
});

const Order = module.exports = mongoose.model('Order', OrderSchema);

module.exports.createOrder = function(_id, orderDetails, callback) {
    const order = new Order(orderDetails);
    Client.findById({_id})
    .then((clientToAdd) => {
        order.client = clientToAdd;
    })
    .then(() => {
        order.save(callback);
    });
}


module.exports.fetchOrders = function(_id, callback) {
    Client.findById({_id})
    .then((clientToFetch) => {
        Order.find({client: clientToFetch}, callback);
    });
}

module.exports.updateOrder = function(_id, orderDetails, callback) {
    Order.update({_id}, orderDetails, callback);
}

module.exports.removeOrder = function(_id, callback) {
    Order.remove({_id}, callback);
}