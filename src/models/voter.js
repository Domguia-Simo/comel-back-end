const mongoose = require('mongoose')
const Schema = mongoose.Schema

const voterSchema = new Schema({
    voterId: { type: String, require: true },
    candidate: { type: String, require: true },
    election: { type: String, require: true },
    voteAt: {
        type: Date,
        default: Date.now,
    },
});

const Voter = mongoose.model('Voter', voterSchema);
module.exports = Voter;