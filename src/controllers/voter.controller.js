const Voter = require("../models/voter");
const nodemailer = require("nodemailer");

exports.getVoters = async (req, res) => {
    try {
        const voter = await Voter.find();
        return res.status(200).json({ voters: voter });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.getVoterByClass = async (req, res) => {
    try {
        let classes = req.body.classes
        const voter = await Voter.find({ class: classes });
        return res.status(200).json({ voters: voter });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.createVoter = async (req, res) => {
    console.log(req.body)


    // console.log(voter);
    for (let index = 0; index < 10; index++) {
        let voter = {
            name: req.body.name + index,
            email: req.body.email + index + '@gmail.com',
            phone: req.body.phone,
            class: req.body.class,
            level: req.body.level,
        }
        const newVoter = new Voter(voter)
        await newVoter.save()
            .then((result) => {
                console.log("save " ,index)
            })
            .catch((err) => {
                console.log(err)
                return res.status(500).json({ message: 'Server error' });
            })
    }
    return res.status(200).send({message:"Users created successfully"});
};
exports.Votes = async (req, res) => {
    try {

            let {name ,email ,classe ,candidate} = req.body
            console.log(req.body)

        let verificationCode = ''
        for (let i = 0; i < 6; i++) {
            let temp = Math.floor(Math.random() * 10)
            verificationCode += temp
        }

        console.log(verificationCode)

        const voters = await Voter.findOne({
            'name': name,
            'email':email,
            'class':classe
        });
        console.log(voters)
        if (voters == null) {
                let newVoter = new Voter({
                    name:name,
                    email:email,
                    verificationCode:verificationCode,
                    verificationTime:20,
                    class:classe,
                    status:'NOT VOTED',
                    votes:{
                        candidate:candidate,
                        doneOn:Date.now(),
                        approvedby:'online'
                    }

                })
                await newVoter.save()
                    .then(async respond => {
                        console.log(respond.name, ":", verificationCode)
                        return res.status(200).json({ message: "a mail have been send to you confrim it" });
                        // // Send the verification code to the user's email
                        // const transporter = nodemailer.createTransport({
                        //     service: 'gmail',
                        //     auth: {
                        //         user: process.env.SENDER_EMAIL,
                        //         pass: process.env.EMAIL_PASSWORD,
                        //     },
                        // });
                        // const mailOptions = {
                        //     from: process.env.SENDER_EMAIL,
                        //     to: 'kamsonganderson39@gmail.com',
                        //     subject: 'Welcome To AICS',
                        //     // html: mailMessages('create-personnel', { randomPassword, name }),
                        //     html: `<h1>Ander</h1>`,
                        //     text: `Your verification code is ${verificationCode}`,
                        // };
                        // await transporter.sendMail(mailOptions, (error, info) => {
                        //     if (error) {
                        //         console.log(error);
                        //         return res.status(409).json({ message: 'check you connection' });
                        //     } else {
                        //         console.log('Email sent: ' + info.response);
                        //         return res.status(200).json({ message: "a mail have been send to you confrim it" });
                        //     }
                        // });
                    })
                    .catch(err => {
                        console.log(err)
                        return res.status(409).json({ message: 'Server error' });
                    })

        } else {
            if(voters.status == 'VOTED')
                return res.status(408).json({ message: 'You already voted' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.validateVotes = async (req, res) => {
    try {
        console.log(req.body)
        let {name ,email ,code ,classe} = req.body

        const voters = await Voter.findOne({
            'name': name,
            'email':email,
            'class':classe,
        });
        if (voters) {
                if (voters.verificationCode == code) {
                    voters.status = "VOTED";
                    await voters.save()
                        .then(async respond => {
                            console.log(respond)
                            return res.status(200).json({ message: "Vote register successfully" ,status:true });
                        })
                        .catch(err => {
                            return res.status(409).json({ message: 'Check you connection' });
                        })
                } else {
                    return res.status(409).json({ message: 'Invalid verification code' });
                }

        } else {
            return res.status(408).json({ message: 'Unauthorise to validate without first voting' });
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