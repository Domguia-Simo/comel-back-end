const mongoose = require('mongoose')
const Schema = mongoose.Schema

const paymentSchema = new mongoose.Schema({
    bodyObject: { type: Object, require: true },
});

const Payment = mongoose.model('payment', paymentSchema);
module.exports = Payment;