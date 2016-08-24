var mongoose = require('mongoose');

var PlayerSchema = new mongoose.Schema({
    _id: Number,
    playerId: Number,
    isAvailable: Boolean
});

module.exports = mongoose.model('Player', PlayerSchema);