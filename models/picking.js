const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Product = require('./product');

const PickingSchema = new Schema ({
    product: {
        //type of product picked
        type: Schema.Types.ObjectId, 
        ref: 'Product'
    },
    pickingWeek: {
        //date of picking
        type: String
    },
    amountHarvested: {
        //how much has been harvested
        type: Number
    }
});

const Picking = module.exports = mongoose.model('Picking', PickingSchema);

module.exports.listHarvests = function(_id, callback) {
    Product.findById({_id})
    .then((product) => {
        Picking.find({product: product})
        .populate({
            path: 'product'
        })
        .exec(callback);
    });
};

module.exports.addHaverst = function(_id, pickingDetails, callback) {
    const picking = new Picking(pickingDetails);
    Product.findById({_id})
    .then((product) => {
        picking.product = product;
    })
    .then(() => {
        picking.save(callback);
    });
}

module.exports.updateHarvest = function(_id, pickingDetails, callback) {
    Picking.update({_id}, pickingDetails, callback);
}

module.exports.removeHarvest = function(_id, callback) {
    Picking.remove({_id}, callback);
}

