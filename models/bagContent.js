const mongoose = require('mongoose');
const FruitSchema = require('./fruit');

var BagContentSchema = mongoose.Schema({
    type: {
        type: String        
    },
    fruit: {
        type: [FruitSchema]
    },
    date: {
        type: Date
    }
});

var BagContent = module.exports = mongoose.model('BagContent', BagContentSchema);

module.exports.createBag = function(newBag, callback) {
    newBag.save(callback);
}

module.exports.removeBagById = function(_id, callback) {
    BagContent.remove({_id}, callback);
}

module.exports.updateBagById = function (_id, updatedBag, callback) {
    BagContent.update({_id}, updatedBag, callback);
}