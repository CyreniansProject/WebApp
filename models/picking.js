const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// helpers
const _ = require('lodash');
const dateFormat = require('dateformat');
const dateHelper = require('./helpers/dates');

// related schemas
const Product = require('./product');

const PickingSchema = new Schema ({
    product: {
        //type of product picked
        type: Schema.Types.ObjectId, 
        ref: 'Product'
    },
    date: {
        //date of harversting
        type: Date
    },
    amountHarvested: {
        //how much has been harvested
        type: Number
    }
});

PickingSchema.virtual('formatDate').get(function() {
    var result = dateFormat(this.date, 'ddd, mmmm dd yyyy');
    return result;
});

PickingSchema.virtual('editDate').get(function() {
    var result = dateFormat(this.date, 'mm-dd-yyyy');
    return result;
});

PickingSchema.virtual('totalWeight').get(function() {
    var result = this.amountHarvested * this.product.avgWeight;
    return result;
});

const Picking = module.exports = mongoose.model('Picking', PickingSchema);

module.exports.listHarvests = function(_id, criteria, callback) {
    Product.findById({_id})
    .then((product) => {
        if (!_.isEmpty(criteria)) {   
            Picking.find({product: product, date: dateHelper.dateRangedSearch(criteria)})
            .sort('date')
            .populate({path: 'product'})
            .exec(callback);
        }
        else {
            Picking.find({product: product})
            .sort('date')
            .populate({path: 'product'})
            .exec(callback);
        }
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

