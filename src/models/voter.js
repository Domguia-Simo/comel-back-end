const mongoose = require('mongoose')
const Schema = mongoose.Schema

const voterSchema = new Schema({
    voterId: { type: String, require: true },
    candidate: { type: String, require: true },
    election: { type: String, require: true },
    voteAt: {
        type: Date,require: true
    },
    TransactionId: { type: String, require: true },
    phone: { type: String, require: true },
});

const Voter = mongoose.model('Voter', voterSchema);
module.exports = Voter;