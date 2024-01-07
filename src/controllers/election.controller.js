const Election = require("../models/Election");


exports.getElections = async (req, res) => {
    try {
        const elections = await Election.find();
        return res.status(200).json({ ele: elections });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.createElection = async (req, res) => {
    console.log(req.body)
    const electionSchema = Joi.object({
        name: Joi.string().required(),
        id: Joi.string().required(),
    });
    const election = {
        id: req.body.id,
        name: req.body.name,
    }
    console.log(election);
    const { error } = electionSchema.validate(election);
    if (error)
        return res.status(500).send(error);
    const newElection = new PaymentRequest(election)
    newElection.save()
        .then((result) => {
            serverio.emit('paymentRequestFront', newElection)
            return res.status(200).send(newElection);
        })
        .catch((err) => console.log(err))
};
exports.closeElection = async (req, res) => {
    const election = await Election.findById(req.body._id);
    console.log(election)
    if (!election.status) {
        try {
            election.status = false;
            election.save()
                .then((result) => {

                })
                .catch((err) => console.log(err))
            // return res.send(existingAcademicYear)
        } catch (err) {
            // console.log(err)
            return res.send({ message: "Access Denied." })
        }
    } else {
        return res.send({ message: "request validated" })
    }
    // if()
}
exports.startElection = async (req, res) => {
    const election = await Election.findById(req.body._id);
    console.log(election)
    if (!election.status) {
        try {
            election.status = false;
            election.save()
                .then((result) => {

                })
                .catch((err) => console.log(err))
            // return res.send(existingAcademicYear)
        } catch (err) {
            // console.log(err)
            return res.send({ message: "Access Denied." })
        }
    } else {
        return res.send({ message: "request validated" })
    }
    // if()
}