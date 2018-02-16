var mongoose = require('mongoose');

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

module.exports.getAllFruit = function(callback) {
    FruitPicking.find({}, callback);
}

module.exports.getAllFruitByName = function(name, callback) {
    FruitPicking.find({item: name}, callback);
}

module.exports.getOneFruitById = function(id, callback) {
    FruitPicking.findById(id, callback);
}

module.exports.createFruit = function(newFruit, callback) {
    newFruit.save(callback);
}

module.exports.removeFruitById = function(_id, callback) {
    FruitPicking.remove({_id}, callback);
}

module.exports.updateFruitById = function (_id, updatedBag, callback) {
    FruitPicking.update({_id}, updatedBag, callback);
}