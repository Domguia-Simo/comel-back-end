const Election = require("../models/Election");


exports.getElections = async (req, res) => {
    try {
        const elections = await Election.find();
        return res.status(200).json(elections);
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
exports.validatePaymentRequest = async (req, res) => {
    const election = await Election.findById(req.body._id);
    console.log(election)
    if (!election.status) {
        try {
            let token = req.body.token || req.query.token || req.headers["x-access-token"];
            const decoded_user_payload = jwt.verify(token, process.env.JWT_TOKEN_KEY);
            console.log(decoded_user_payload);
            const student = await Student.findById(paymentrequest.id, {
                'academicInfo.academicYears': 1
            });
            let AcademicYear = {
                year: paymentrequest.year,
            }
            let existingAcademicYear = await student.academicInfo.academicYears.filter((option) => option.year === paymentrequest.year);
            if (existingAcademicYear.length === 0)
                student.academicInfo.academicYears.push(AcademicYear)
            if (paymentrequest.kind === 'PreRegistration') {
                let registration = {
                    amount: paymentrequest.amount,
                    penality: paymentrequest.penality,
                    paidDate: new Date(),
                    paymentMethod: 'In Cash',
                    receivedBy: decoded_user_payload.id
                }
                student.academicInfo.academicYears.filter((option) => option.year === paymentrequest.year)[0].registration = registration;
                existingAcademicYear = await student.academicInfo.academicYears.filter((option) => option.year === paymentrequest.year);
                student.save()
                    .then((result) => {
                        paymentrequest.validated.status = true;
                        paymentrequest.validated.On = new Date();
                        paymentrequest.validated.By = {
                            name: decoded_user_payload.name,
                            id: decoded_user_payload.id,
                        };
                        paymentrequest.save()
                            .then((result) => {
                                serverio.emit('paymentRequestValidatedFront', student)
                                return res.status(200).send(student);
                            })
                            .catch((err) => console.log(err))
                    })
                    .catch((err) => console.log(err))
                // return res.send(existingAcademicYear)
            } else {
                // console.log("err")
                return res.send({ message: "Access Denied." })
            }
        } catch (err) {
            // console.log(err)
            return res.send({ message: "Access Denied." })
        }
    } else {
        return res.send({ message: "request validated" })
    }
    // if()
}