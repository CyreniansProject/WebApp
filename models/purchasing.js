const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Product = require('./product');

const PurchasingSchema = new Schema ({
    product: {
        // type of product purchased
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    date: {
        // date of picking
        type: String
    },
    amountPurchased: {
        // how much has been purchased
        type: Number
    },
    price: {
        // price for a single unit
        type: Number
    }
});

const Purchasing = module.exports = mongoose.model('Purchasing', PurchasingSchema);

module.exports.listPurchases = function(_id, callback) {
    Product.findById({_id})
    .then((product) => {
        Purchasing.find({product: product})
        .populate({
            path: 'product'
        })
        .exec(callback);
    });
};

module.exports.addPurchase = function(_id, purchaseDetails, callback) {
    const purchase = new Purchasing(purchaseDetails);
    Product.findById({_id})
    .then((product) => {
        purchase.product = product;
    })
    .then(() => {
        purchase.save(callback);
    });
}

module.exports.updatePurchase = function(_id, purchaseDetails, callback) {
    Purchasing.update({_id}, purchaseDetails, callback);
}

module.exports.removePurchase = function(_id, callback) {
    Purchasing.remove({_id}, callback);
}