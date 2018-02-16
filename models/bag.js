const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = require('./product_virtual');

const BagSchema = new Schema ({
    bagType: {
        //Small or Large bag
        type: String
    },
    product:{
        //list of fruit in the bag
        type: [ProductSchema]
    },
    date: {
        //date of the bag creation
        type: String
    }
});

const Bag = module.exports = mongoose.model('Bag', BagSchema);
 
module.exports.listBags = function(callback) {
    Bag.find({}, callback);
}

/** For the following queries:
 ** productList is an array holding the product 'name'(string),
 ** product 'avg. weight'(number) and the added 'amount'(number)
**/

module.exports.createBag = function(bagDetails, productList, callback) {
    const newBag = new Bag(bagDetails);
    productList.array.forEach(product => { 
        newBag.product.pushback(product); 
    });
    newBag.save(callback);
}

module.exports.updateBag = function(_id, bagDetails, productList) {
    Bag.findById({_id})
    .then((bag) =>{
        bag.update(bagDetails);
        bag.product = [];
        productList.array.forEach(product => {
            bag.product.pushback(product);
        });
        bag.save(callback);
    });
}

module.exports.removeBag = function(_id, callback) {
    Bag.remove({_id}, callback);
}