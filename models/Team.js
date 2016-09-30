var mongoose = require('mongoose');

var TeamSchema = new mongoose.Schema({
    username: String,
    event: Number,
    players: [Number],
    transfers: [{
        playerIn: Number,
        playerOut: Number
    }],
    points: Number
});

module.exports = mongoose.model('Team', TeamSchema);