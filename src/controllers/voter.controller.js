const Voter = require("../models/voter");
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken')
const nodemailer = require("nodemailer");
const moment = require("moment");
dotenv.config();

exports.getVoters = async (req, res) => {
    try {
        const voter = await Voter.find();
        return res.status(200).json({ voters: voter.length });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.getVoterByClass = async (req, res) => {
    try {
        let classes = req.body.classes || req.params.classes
        console.log(classes)
        const voter = await Voter.find({ class: classes });
        console.log(voter)
        return res.status(200).json({ voters: voter });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.createVoter = async (req, res) => {
    console.log(req.body)
    let { name, email, classe, candidate } = req.body

    const voters = await Voter.find();
    let votes = {
        candidate: "659b46a46d17e014cb28ceb3",
        doneOn: new Date,
        approvedby: 'ONLINE',
    }
    for (let index = 20; index < voters.length; index++) {
        const voter = voters[index];
        console.log(voter._id)
        console.log(voter.name)
        if (voter.votes)
            voter.votes.election = '659b1e70d7a408d0cba7d535'
        // voter.status = "VOTED"
        await voter.save()
            .then(result => {
                console.log("index" + index + "sAVE");
            })
            .catch(err => console.log(err));

    }
    return res.status(200).send({ message: "Users created successfully" });
};
exports.Votes = async (req, res) => {
    try {
        let { name,
            email,
            classe,
            candidate,
            token,
            position,
        } = req.body
        let voterModel = {
            name: name,
            email: email,
            class: classe,
            candidate: candidate,
        }
        let votes = {
            candidate: candidate,
            doneOn: new Date,
            election: '659b1e70d7a408d0cba7d535',
            doneAt: position,
            // approvedby: 'ONLINE',
        }
        let verificationCode = ''
        for (let i = 0; i < 6; i++) {
            let temp = Math.floor(Math.random() * 10)
            verificationCode += temp
        }
        const voters = await Voter.findOne({
            'name': name,
            'email': email,
            'class': classe,
        });
        // console.log(voters)
        if (voters) {
            if (voters.status.toLowerCase() !== 'voted') {
                voters.votes = votes;
                voters.verificationCode = verificationCode;
                voters.verificationTime = new Date;

                if (token) {
                    try {
                        const decoded_user_payload = jwt.verify(token, 'mytoken');
                        voters.votes.approvedby = decoded_user_payload.id
                        voters.votes.name = decoded_user_payload.name
                        voters.status = "VOTED";
                        console.log(voters)
                        await voters.save()
                            .then(async respond => {
                                console.log(respond)
                                return res.status(200).json({ message: "you voted have be accepted", statusAdmin: true });
                            })
                            .catch(err => {
                                return res.status(408).json({ message: 'check you connection' });
                            })
                    } catch (err) {
                        console.log(err)
                        return res.status(404).json({ message: 'you session has exprie', statusLogin: true });
                    }
                } else {
                    voters.votes.approvedby = 'ONLINE'
                    console.log(voters)
                    await voters.save()
                        .then(async respond => {
                            console.log(respond.name, ":", verificationCode)
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
                                // html: `<h1>Ander</h1>`,
                                text: `Your verification code is ${verificationCode}`,
                            };
                            await transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {
                                    console.log(error);
                                    return res.status(409).json({ message: 'check you connection' });
                                } else {
                                    console.log('Email sent: ' + info.response);
                                    return res.status(200).json({ message: "a mail have been send to you confrim it", status: true });
                                }
                            });
                        })
                        .catch(err => {
                            console.log(err)
                            return res.status(408).json({ message: 'check you connection' });
                        })
                }

                //
            } else {
                return res.status(407).json({ message: 'already Voted', statusAdmin: true });
            }
        } else {
            console.log('you are not Voter')
            return res.status(407).json({ message: 'you are not Voter', statusAdmin: true });
            // let voter = {
            //     name: voterModel.name,
            //     email: voterModel.email,
            //     class: voterModel.class,
            //     level: voterModel.level,
            //     votes: votes,
            //     verificationCode: verificationCode,
            //     verificationTime: new Date
            // }
            // const newVoter = new Voter(voter)
            // await newVoter.save()
            //     .then(async respond => {
            //         console.log(respond.name, ":", verificationCode)
            //         // Send the verification code to the user's email
            //         const transporter = nodemailer.createTransport({
            //             service: 'gmail',
            //             auth: {
            //                 user: process.env.SENDER_EMAIL,
            //                 pass: process.env.EMAIL_PASSWORD,
            //             },
            //         });
            //         const mailOptions = {
            //             from: process.env.SENDER_EMAIL,
            //             to: voterModel.email,
            //             subject: 'Welcome To AICS',
            //             // html: mailMessages('create-personnel', { randomPassword, name }),
            //             html: `<h1>Ander</h1>`,
            //             text: `Your verification code is ${verificationCode}`,
            //         };
            //         await transporter.sendMail(mailOptions, (error, info) => {
            //             if (error) {
            //                 console.log(error);
            //                 return res.status(409).json({ message: 'check you connection' });
            //             } else {
            //                 console.log('Email sent: ' + info.response);
            //                 return res.status(200).json({ message: "a mail have been send to you confrim it" });
            //             }
            //         });
            //     })
            //     .catch(err => {
            //         console.log(err)
            //         return res.status(408).json({ message: 'check you connection' });
            //     })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.validateVotes = async (req, res) => {
    try {
        console.log(req.body)
        let { name,
            email,
            classe,
            code
        } = req.body
        if(!parseInt(code)){
            return res.status(409).json({ message: 'the verification code is a number' });
        }
        const voters = await Voter.findOne({
            'name': name,
            'email': email,
            'class': classe,
            'verificationCode': code,
        });
        console.log(voters);
        if (voters) {
            if (voters.status.toLowerCase() !== 'voted') {
                voters.status = "VOTED";
                await voters.save()
                    .then(async respond => {
                        console.log(respond)
                        return res.status(200).json({ message: "you voted have be accepted", statusAdmin: true });
                    })
                    .catch(err => {
                        return res.status(409).json({ message: 'check you connection' });
                    })
            } else {
                return res.status(409).json({ message: 'Already voted', statusAdmin: true });
            }
        } else {
            return res.status(409).json({ message: 'Invalid code' });
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
            if (voters.status.toLowerCase() !== 'voted') {
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