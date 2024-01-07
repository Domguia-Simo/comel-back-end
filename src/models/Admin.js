const mongoose = require('mongoose')
const Schema = mongoose.Schema

const adminSchema = new Schema({
    name: { type: String, require: true },
    token: { type: String, require: true },
    accountType: { type: String, require: true },
    email: {
        type: String,
        require: true,
        match: /.+\@.+\..+/, // Simple regex for email validation
        unique: true
    },
    password: {
        type: String,
        default: null
    },
    passwordString: { type: String, require: true },
    phone: { type: String, require: true },
    class: { type: String, require: true },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    location: Object,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin