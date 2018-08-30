const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// helpers
const _ = require('lodash');
const dateFormat = require('dateformat');
const dateHelper = require('./helpers/dates');

// related schemas
const Product = require('./product');

const PurchasingSchema = new Schema ({
    // type of product purchased
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    // date of purchase
    date: {
        type: Date
    },
    // how many units have been purchased
    amountPurchased: {
        type: Number
    },
    // price for a single unit
    price: {
        type: Number
    }
});

PurchasingSchema.virtual('formatDate').get(function() {
    var result = dateFormat(this.date, 'ddd, mmmm dd yyyy');
    return result;
});

PurchasingSchema.virtual('editDate').get(function() {
    var result = dateFormat(this.date, 'mm-dd-yyyy');
    return result;
});

PurchasingSchema.virtual('totalPrice').get(function() {
    var result = this.amountPurchased * this.price;
    return result;
});

PurchasingSchema.virtual('totalWeight').get(function() {
    var result = this.amountPurchased * this.product.avgWeight;
    return result;
});

const Purchasing = module.exports = mongoose.model('Purchasing', PurchasingSchema);

module.exports.listPurchases = function(_id, criteria, callback) {
    Product.findById({_id})
    .then((product) => {
        if (!_.isEmpty(criteria)) {
            Purchasing.find({product: product, date: dateHelper.dateRangedSearch(criteria)})
            .populate({path: 'product'})
            .exec(callback);
        }
        else {
            Purchasing.find({product: product})
            .populate({path: 'product'})
            .exec(callback);
        }
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