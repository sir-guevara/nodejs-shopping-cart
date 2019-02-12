var mongoose = require('mongoose');
var Schema = mongoose.Schema

var schema = new Schema({
    imagePath: {type:String, required:true},
    title: {type:String, required: true},
    description: {type:String},
    amount: {type:Number, required: true},
    unit: {type: String, required: true},
    type: {type: String, required: true},
    summary: {type: String},
    date: { type: Date, default: Date.now },
    price: {type:Number, required:  true}
});

module.exports = mongoose.model('Product', schema);