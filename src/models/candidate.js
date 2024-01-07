const mongoose = require('mongoose')
const Schema = mongoose.Schema


const candidateSchema = new Schema({
    name: { type: String, require: true },
    email: {
        type: String,
        require: true,
        match: /.+\@.+\..+/, // Simple regex for email validation
        unique: true
    },
    desc: { type: String, require: true },
    phone: { type: String, require: true },
    class: { type: String, require: true },
    photo: { type: String, require: true },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    location: Object,
    createdBy:{ type: String, require: true },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Candidate = mongoose.model('Candidate', candidateSchema);
module.exports = Candidate