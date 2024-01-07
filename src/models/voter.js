
const voterSchema = new Schema({
    name: { type: String, require: true },
    accountType: { type: String, require: true },
    status: {
        type: String,
        enum: ['VOTED', 'NOT VOTED'],
        require: true
    },
    email: {
        type: String,
        require: true,
        match: /.+\@.+\..+/, // Simple regex for email validation
        unique: true
    },
    verificationCode:  { type: Number, require: true },
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

const Voter = mongoose.model('Voter', voterSchema);
export default Voter;