const Candidate = require("../models/candidate");
const Election = require("../models/Election");
const Voter = require("../models/voter");
const adminModel = require('../models/Admin.js')


exports.getElections = async (req, res) => {
    try {
        const elections = await Election.find();
        return res.status(200).json({ election: elections });
    } catch (error) {
        // console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.electionResult = async (req, res) => {
    try {
        let id = req.body.id || req.params.id;
        // console.log(id)
        const elections = await Election.findOne({ _id: id });
        // console.log(elections);
        // if (elections.endDate) {
        const candidates = await Candidate.find({ election: id });
        const voters = await Voter.find();
        // console.log(voters);
        // const voters = await Voter.find({ "votes.election": id });
        return res.status(200).json({
            election: elections,
            candidates: candidates,
            voters: voters,
            message: 'Election end'
        });
        // } else {
        //     return res.status(200).json({
        //         election: [],
        //         candidates: [],
        //         voters: [],
        //         message: 'Election not yet end'
        //     });
        // }
    } catch (error) {
        // console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.createElection = async (req, res) => {
    // console.log(req.body)
    // const electionSchema = Joi.object({
    //     title: Joi.string().required(),
    // });
    const election = {
        title: req.body.title,
    }
    // console.log(election);
    // const { error } = electionSchema.validate(election);
    // if (error)
    //     return res.status(500).send(error);
    let admin = await adminModel.findOne({ _id: req.Id })
    if (admin) {
        if (admin.accountType === "SuperAdmin") {
            const newElection = new Election(election)
            newElection.save()
                .then((result) => {
                    return res.status(200).send({ message: `Election create sucessfully.`, status: true });
                })
                .catch((err) => {
                    return res.status(409).send({ message: "An error occur check you connection", status: false });
                })
        } else {
            return res.status(400).json({ message: 'Acess Denied' });
        }
    } else {
        return res.status(400).json({ message: 'Acess Denied' });
    }
};
exports.closeElection = async (req, res) => {
    let id = req.params.id
    // console.log(id)
    let admin = await adminModel.findOne({ _id: req.Id })
    if (admin) {
        if (admin.accountType === "SuperAdmin") {
            const election = await Election.findById(id);
            // console.log(election)
            if (election) {
                if (!election.endDate && election.status === 'OCCURRING' ) {
                    try {
                        election.status = 'END';
                        election.endDate = new Date
                        election.save()
                            .then((result) => {
                                return res.status(200).send({ message: `Election end sucessfully on ${election.stateDate}.`, status: true });
                            })
                            .catch((err) => {
                                return res.status(409).send({ message: "An error occur check you connection", status: false });
                            })
                    } catch (err) {
                        // console.log(err)
                        return res.send({ message: "Access Denied." })
                    }
                } else {
                    return res.send({ message: "election already ended or not yet start", status: false })
                }
            } else {
                return res.send({ message: "election not more avaliable", status: false })
            }
        } else {
            return res.status(400).json({ message: 'Acess Denied' });
        }
    } else {
        return res.status(400).json({ message: 'Acess Denied' });
    }
}
exports.startElection = async (req, res) => {
    // console.log(req.body)
    let id = req.params.id
    // console.log(id)
    let admin = await adminModel.findOne({ _id: req.Id })
    if (admin) {
        if (admin.accountType === "SuperAdmin") {
            const election = await Election.findById(id);
            // console.log(election)
            if (election) {
                if (!election.stateDate) {
                    try {
                        election.status = 'OCCURRING';
                        election.stateDate = new Date
                        election.save()
                            .then((result) => {
                                return res.status(200).send({ message: `Election start sucessfully on ${election.stateDate}.`, status: true });
                            })
                            .catch((err) => {
                                return res.status(509).send({ message: "An error occur check you connection", status: false });
                            })
                    } catch (err) {
                        return res.status(403).json({ message: "An error occur check you connection.", status: false })
                    }
                } else {
                    return res.status(503).json({ message: "election already started", status: false })
                }
            } else {
                return res.send({ message: "election not more avaliable", status: false })
            }
        } else {
            return res.status(400).json({ message: 'Acess Denied' });
        }
    } else {
        return res.status(400).json({ message: 'Acess Denied' });
    }
}
exports.deleteElection = async (req, res) => {
    // console.log(req.Id)
    let id = req.body.id || req.params.id;
    let admin = await adminModel.findOne({ _id: req.Id })
    if (admin) {
        if (admin.accountType === "SuperAdmin") {
            await Election.findByIdAndDelete(id)
                .then((result) => {
                    return res.status(200).send({ message: 'Election deleted successfully', status: true });
                })
                .catch((err) => {
                    return res.send({ message: "an error occur while deleting", status: false })
                })
        } else {
            return res.status(400).json({ message: 'Acess Denied' });
        }
    } else {
        return res.status(400).json({ message: 'Acess Denied' });
    }
};