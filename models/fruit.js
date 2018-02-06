var mongoose = require('mongoose');

var FruitSchema = mongoose.Schema({
    item: { 
        type: String
    },
    avgWeight: {
        type: Number
    },
    fruitAmount: {
        type: Number
    }
});

module.exports = FruitSchema;