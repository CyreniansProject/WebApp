const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema ({
    name: {
        type: String
    },
    avgWeight: {
        type: Number
    },
    amountSmall: {
        type: Number
    },
    amountMedium: {
        type: Number
    },
    amountLarge: {
        type: Number
    }
});

ProductSchema.pre('remove', function(next) {
    this.model('picking').remove({ product: this._id }, next);
});

const Product = module.exports = mongoose.model('Product', ProductSchema);

module.exports.listProducts = function(callback) {
    Product.find({})
    .sort('name')
    .exec(callback);
}

module.exports.createProduct = function(productDetails, callback) {
    const newProduct = new Product(productDetails);
    newProduct.save(callback);
}

module.exports.updateProduct = function(_id, productDetails, callback) {
    Product.update({_id}, productDetails, callback);
}

module.exports.removeProduct = function(_id, callback) {
    Product.remove({_id}, callback);
}