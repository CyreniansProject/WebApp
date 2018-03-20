const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClientSchema = new Schema({
    name: {
        // full name
        type: String
    },
    frequency: {
        // freq of the orders (weekly/forthnightly/monthly)
        type: String
    },
    email: {
        // example@email.com
        type: String,
        unique: true
    },
    account: {
        // bank account number (used to pay)
        type: Number
    },
    address: {
        // delivery address
        type: String
    }
});

const Client = module.exports = mongoose.model('Client', ClientSchema);

const Order = require('./order');

module.exports.listClients = function(callback) {
    Client.find({})
    .sort('name')
    .exec(callback);
}

module.exports.createClient = function(clientDetails, callback) {
    const client = new Client(clientDetails);
    client.save(callback);
}

module.exports.removeClient = function(_id, callback) {
    Client.remove({_id}, callback);
}

module.exports.updateClient = function(_id, clientDetails, callback) {
    Client.update({_id}, clientDetails, callback);
}