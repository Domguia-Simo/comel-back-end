const Voter = require("../models/voter");

exports.Votes = async (req, res) => {
    try {
        console.log(req.body)
        let voterModel = {
            name: req.body.name,
            email: req.body.email,
            class: req.body.class,
            level: req.body.level,
            candidate: req.body.candidate,
        }
        let votes = {
            candidate: voterModel.candidate,
            doneOn: new Date,
            doneAt: '',
            approvedby: '',
        }
        let verificationCode = ''
        for (let i = 0; i < 6; i++) {
            let temp = Math.floor(Math.random() * 10)
            verificationCode += temp
        }
        const voters = await Voter.findOne({
            'name': voterModel.name,
            'email': voterModel.email,
            'class': voterModel.class,
            'level': voterModel.level,
        });
        if (voters) {
            if (voters.status.toLowerCase() === 'voted') {
                voters.votes = votes;
                voters.verificationCode = verificationCode;
                voters.verificationTime = new Date;
                await voters.save()
                    .then(async respond => {
                        console.log(respond)
                        // Send the verification code to the user's email
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: process.env.SENDER_EMAIL,
                                pass: process.env.EMAIL_PASSWORD,
                            },
                        });
                        const mailOptions = {
                            from: process.env.SENDER_EMAIL,
                            to: voterModel.email,
                            subject: 'Welcome To AICS',
                            // html: mailMessages('create-personnel', { randomPassword, name }),
                            text: `Your verification code is ${verificationCode}`,
                        };

                        await transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.log(error);
                                return res.status(409).json({ message: 'check you connection' });
                            } else {
                                console.log('Email sent: ' + info.response);
                                return res.status(200).json({ message: "a mail have been send to you confrim it" });
                            }
                        });

                    })
                    .catch(err => {
                        return res.status(409).json({ message: 'check you connection' });
                    })

            } else {
                return res.status(409).json({ message: 'already Voted' });
            }
        } else {
            return res.status(408).json({ message: 'Enter correct creatidential' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.validateVotes = async (req, res) => {
    try {
        console.log(req.body)
        let voterModel = {
            name: req.body.name,
            code: req.body.code,
            email: req.body.email,
            class: req.body.class,
            level: req.body.level,
            candidate: req.body.candidate,
        }
        const voters = await Voter.findOne({
            'name': voterModel.name,
            'email': voterModel.email,
            'class': voterModel.class,
            'level': voterModel.level,
        });
        if (voters) {
            if (voters.status.toLowerCase() === 'voted') {
                if (voters.verificationCode === voterModel.code) {
                    voters.status = "VOTED";
                    await voters.save()
                        .then(async respond => {
                            console.log(respond)
                            return res.status(200).json({ message: "you voted have be accepted" });

                        })
                        .catch(err => {
                            return res.status(409).json({ message: 'check you connection' });
                        })
                } else {
                    return res.status(409).json({ message: 'Invalid code' });
                }
            } else {
                return res.status(409).json({ message: 'Invalid code' });
            }
        } else {
            return res.status(408).json({ message: 'Enter correct creatidential' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.VotesByAdmin = async (req, res) => {
    try {
        console.log(req.body)
        let voterModel = {
            name: req.body.name,
            email: req.body.email,
            class: req.body.class,
            level: req.body.level,
            candidate: req.body.candidate,
        }
        let votes = {
            candidate: voterModel.candidate,
            doneOn: new Date,
            doneAt: '',
            approvedby: '',
            name: ''
        }
        const voters = await Voter.findOne({
            'name': voterModel.name,
            'email': voterModel.email,
            'class': voterModel.class,
            'level': voterModel.level,
        });
        if (voters) {
            if (voters.status.toLowerCase() === 'voted') {
                voters.votes = votes;
                voters.status = "VOTED";
                await voters.save()
                    .then(async respond => {
                        console.log(respond)
                        return res.status(200).json({ message: "you voted have be accepted" });
                    })
                    .catch(err => {
                        return res.status(409).json({ message: 'check you connection' });
                    })

            } else {
                return res.status(409).json({ message: 'already Voted' });
            }
        } else {
            return res.status(408).json({ message: 'Enter correct creatidential' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};