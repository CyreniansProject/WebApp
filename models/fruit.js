var mongoose = require('mongoose');

const _DB = require('../config/keys');
mongoose.connect(_DB.CONN_URL, { useMongoClient: true });

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