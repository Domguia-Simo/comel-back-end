const Election = require("../models/Election");


exports.getElections = async (req, res) => {
    try {
        const elections = await Election.find();
        return res.status(200).json({ election: elections });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.createElection = async (req, res) => {
    console.log(req.body)
    // const electionSchema = Joi.object({
    //     title: Joi.string().required(),
    // });
    const election = {
        title: req.body.title,
    }
    console.log(election);
    // const { error } = electionSchema.validate(election);
    // if (error)
    //     return res.status(500).send(error);
    const newElection = new Election(election)
    newElection.save()
        .then((result) => {
            return res.status(200).send(newElection);
        })
        .catch((err) => console.log(err))
};
exports.closeElection = async (req, res) => {
    console.log(req.body)
    const election = await Election.findById(req.body.id);
    console.log(election)
    if (election) {
        if (!election.endDate) {
            try {
                election.status = true;
                election.endDate = new Date
                election.save()
                    .then((result) => {
                        return res.status(200).send({ message: `Election end sucessfully on ${election.stateDate}.` });
                    })
                    .catch((err) => {
                        return res.status(409).send({ message: "An error occur check you connection" });
                    })
            } catch (err) {
                // console.log(err)
                return res.send({ message: "Access Denied." })
            }
        } else {
            return res.send({ message: "election not more avaliable" })
        }
    } else {
        return res.send({ message: "election not more avaliable" })
    }
}
exports.startElection = async (req, res) => {
    console.log(req.body)
    const election = await Election.findById(req.body.id);
    console.log(election)
    if (election) {
        if (!election.stateDate) {
            try {
                election.status = true;
                election.stateDate = new Date
                election.save()
                    .then((result) => {
                        return res.status(200).send({ message: `Election start sucessfully on ${election.stateDate}.` });
                    })
                    .catch((err) => {
                        return res.status(409).send({ message: "An error occur check you connection" });
                    })
            } catch (err) {
                // console.log(err)
                return res.send({ message: "Access Denied." })
            }
        } else {
            return res.send({ message: "election not more avaliable" })
        }
    } else {
        return res.send({ message: "election not more avaliable" })
    }
}
exports.deleteElection = async (req, res) => {
    let id = req.body.id || req.params.id;
    await Election.findByIdAndDelete(id)
        .then((result) => {
            return res.status(200).send({message:'Election deleted successfully'});
        })
        .catch((err) => {
            return res.send({ message: "an error occur while deleting" })
        })
};