var mongoose = require('mongoose');

var TransferOrderSchema = new mongoose.Schema({
    username: String,
    next: String,
    started: Boolean
}, {
    collection: 'TransferOrder'
});

module.exports = mongoose.model('TransferOrder', TransferOrderSchema);