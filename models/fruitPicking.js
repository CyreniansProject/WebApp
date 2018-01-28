var mongoose = require('mongoose');

const _DB = require('../config/keys');
mongoose.connect(_DB.CONN_URL, { useMongoClient: true });

var FruitPickingSchema = mongoose.Schema({
    item: {
        type: String,
        require: true
    },
    avgWeight: {
        type: Number,
        require: true
    },
    pickDate: {
        type: Date
    },
    amountPicked: {
        type: Number
    }
});

var FruitPicking = module.exports = mongoose.model('FruitPicking', FruitPickingSchema);

module.exports.createFruit = function(newFruit, callback) {
    newFruit.save(callback);
}

module.exports.removeFromBag = function(_id, callback) {
    FruitPicking.remove({_id}, callback);
}

module.exports.updateBag = function (_id, updatedBag, callback) {
    FruitPicking.update({_id}, updatedBag, callback);
}