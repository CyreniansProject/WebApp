const mongoose = require('mongoose');
const FruitSchema = require('./fruit');

const _DB = require('../config/keys');
mongoose.connect(_DB.CONN_URL, { useMongoClient: true });

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

module.exports.removeBag = function(_id, callback) {
    BagContent.remove({_id}, callback);
}

module.exports.updateBag = function (_id, updatedBag, callback) {
    BagContent.update({_id}, updatedBag, callback);
}