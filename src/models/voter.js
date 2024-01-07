const mongoose = require('mongoose')
const Schema = mongoose.Schema

const VotesSchema = new Schema({
    candidate: { type: String, require: true },
    doneOn: { type: String, require: true },
    approvedby: { type: String, require: true },
},{_id:false})

const voterSchema = new Schema({
    name: { type: String, require: true },
    status: {
        type: String,
        enum: ['VOTED', 'NOT VOTED'],
        require: true,
        default: "NOT VOTED"
    },
    email: {
        type: String,
        require: true,
        match: /.+\@.+\..+/, // Simple regex for email validation
        unique: true
    },
    votes: { type: VotesSchema , require: true },
    verificationCode: { type: Number, require: true },
    verificationTime: { type: Number, require: true },
    class: { type: String, require: true },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Voter = mongoose.model('Voter', voterSchema);
module.exports = Voter;