const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// helpers
const _ = require('lodash');
const dateFormat = require('dateformat');
const dateHelper = require('./helpers/dates');

// related schemas
const Product = require('./product');

const BagSchema = new Schema ({
    //list of products in the bag
    product: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    //date of the bag creation
    startDate: {
        type: Date
    },
    //date of the bag expiration
    endDate: {
        type: Date
    },
    type: {
        type: String
    },
    price: {
        type: Number
    }
});

BagSchema.virtual('formatStartDate').get(function() {
    var result = dateFormat(this.startDate, 'ddd, mmmm dd yyyy');
    return result;
});

BagSchema.virtual('formatEndDate').get(function() {
    var result = dateFormat(this.endDate, 'ddd, mmmm dd yyyy');
    return result;
});

BagSchema.virtual('editStartDate').get(function() {
    var result = dateFormat(this.startDate, 'mm-dd-yyyy');
    return result;
});

BagSchema.virtual('editEndDate').get(function() {
    var result = dateFormat(this.endDate, 'mm-dd-yyyy');
    return result;
});

const Bag = module.exports = mongoose.model('Bag', BagSchema);
 
module.exports.listBags = function(criteria, callback) {
    if (!_.isEmpty(criteria)) {
        Bag.find({startDate: dateHelper.dateRangedSearch(criteria)})
        .populate({path: 'product'})
        .exec(callback);
    }
    else {
        Bag.find({})
        .populate({path: 'product'})
        .exec(callback);
    }
}

module.exports.createBag = function(bagDetails, productList, callback) {
    var bag = new Bag(bagDetails);
    var count = productList.length;

    productList.forEach(productId => { 
        Product.findById({_id: productId}, function(err, product) {
            bag.product.push(product);
            count--;
             // save the data
             if (count == 0)
                return bag.save(callback);
        })
    });
}

module.exports.updateBag = function(_id, bagDetails, productList, callback) {
    var count = productList.length;
    
    Bag.findById({_id})
    .then((bag) => {
        bag.product = [];
        productList.forEach(productId => {
            Product.findById({_id: productId}, function(err, product) {
                bag.product.push(product);
                count--;
                // save the data
                if (count == 0) {
                    bag.save();
                    return Bag.update({_id}, bagDetails, callback);
                }
            });
        });
    });
}

module.exports.removeBag = function(_id, callback) {
    Bag.remove({_id}, callback);
}