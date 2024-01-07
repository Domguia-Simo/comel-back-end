const mongoose = require('mongoose')

const electionSchema = new mongoose.Schema({
    title: { type: String, require: true },
    desc: { type: String, require: true },
    state_date:{ type: Date, require: true },
    end_date:{ type: Date, require: true },
    status: {
        type: Boolean,
        default: true
    },
    createdBy:{ type: String, require: true },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Election = mongoose.model('Election', electionSchema);
module.exports = Election;