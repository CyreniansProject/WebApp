const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name:{
        type: String
    },
    avgWeight:{
        type: Number
    },
    productsNumber:{
        type: Number
    }
});

module.exports = ProductSchema;