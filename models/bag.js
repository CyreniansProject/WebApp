const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Product = require('./product');

const BagSchema = new Schema ({
    product: [{
        //list of fruit in the bag
        type: Schema.Types.ObjectId, ref: 'Product'
    }],
    startDate: {
        //date of the bag creation
        type: String
    },
    endDate: {
        //date of the bag expiration
        type: String
    },
    priceSmall: {
        type: Number
    },
    priceMedium: {
        type: Number
    },
    priceLarge: {
        type: Number
    }
});

const Bag = module.exports = mongoose.model('Bag', BagSchema);
 
module.exports.listBags = function(callback) {
    Bag.find({}, callback);
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
                if (count == 0)
                    return bag.save(bagDetails, callback);
            });
        });
    });
}

module.exports.removeBag = function(_id, callback) {
    Bag.remove({_id}, callback);
}