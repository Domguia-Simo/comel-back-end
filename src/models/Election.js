const mongoose = require('mongoose')
const Schema = mongoose.Schema

const electionSchema = new mongoose.Schema({
    title: { type: String, require: true },
    desc: { type: String, require: true },
    stateDate:{ type: Date, require: true },
    endDate:{ type: Date, require: true },
    status: {
        type: Boolean,
        default: false
    },
    createdBy:{ type: String, require: true },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Election = mongoose.model('Election', electionSchema);
module.exports = Election;