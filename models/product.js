const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema ({
    name: {
        type: String
    },
    /** definition of the 'amount' of the product 
     ** that will be added in each bag (kg) **/
    avgWeight: {
        type: Number
    }
});

const Product = module.exports = mongoose.model('Product', ProductSchema);

ProductSchema.pre('remove', function(next) {
    this.model('Picking').remove({ product: this._id });
    this.model('Purchasing').remove({ product: this._id }, next);
});

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