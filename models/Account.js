var mongoose = require('mongoose');

var AccountSchema = new mongoose.Schema({
    _id: String,
    username: String,
    name: String,
    transferLimit: Number,
    transferTurn: Number,
    email: String,
    teamName: String,
    password: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Account', AccountSchema);