const Voter = require("../models/voter");
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken')
const nodemailer = require("nodemailer");
const moment = require("moment");
const Candidate = require("../models/candidate");
const Admin = require("../models/Admin");
const Election = require("../models/Election");
// const { PaymentOperation, RandomGenerator } = require('../../payment/mesomb');
const { PaymentOperation, RandomGenerator } = require('@hachther/mesomb');
const fetch = require('node-fetch');
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
    // let { name, email, classe, candidate } = req.body
    let name = 'SE2022L1B2'
    // let = 'simo'
    const voters = await Voter.find();

    for (let index = 0; index < 10; index++) {
        // console.log("elt1", voters[index].name)
        // let voter = {
        //     name: name + index,
        //     email: name + index + '@gmail.com',
        //     class: 'L1A'
        // }
        // const newVoter = new Voter(voter)
        await Voter.findByIdAndDelete(voters[index]._id)
            // await newVoter.save()
            .then((result) => {
                console.log("elt del", voters[index]._id)
            })
            .catch((err) => {

                console.log("errors", err)
                console.log("errors", voters[index]._id)
            })

    }
    // let votes = {
    //     candidate: "659b46a46d17e014cb28ceb3",
    //     doneOn: new Date,
    //     approvedby: 'ONLINE',
    // }
    // for (let index = 20; index < voters.length; index++) {
    //     const voter = voters[index];
    //     console.log(voter._id)
    //     console.log(voter.name)
    //     if (voter.votes)
    //         voter.votes.election = '659b1e70d7a408d0cba7d535'
    //     // voter.status = "VOTED"
    //     await voter.save()
    //         .then(result => {
    //             console.log("index" + index + "sAVE");
    //         })
    //         .catch(err => console.log(err));

    // }
    return res.status(200).send({ message: "Users created successfully 3" });
};
function isPointInZone(point, zone) {
    // Extract the coordinates of the point
    const { latitude, longitude } = point;

    // Check if the latitude is within the zone's boundaries
    if (latitude >= zone.minLatitude && latitude <= zone.maxLatitude) {
        // Check if the longitude is within the zone's boundaries
        if (longitude >= zone.minLongitude && longitude <= zone.maxLongitude) {
            return true; // The point is within the zone
        }
    }

    return false; // The point is outside the zone
}
const collectMoney = async ({ service, payer }) => {
    const payment = new PaymentOperation({
        applicationKey: process.env.MESOMB_APPLICATION_KEY,
        accessKey: process.env.MESOMB_ACCESS_KEY,
        secretKey: process.env.MESOMB_SECRET_KEY
    });
    console.log("collect money 1")
    try {
        const response = await payment.makeCollect({
            amount: 100,
            service: service,
            payer: payer,
            nonce: RandomGenerator.nonce()
        });
        console.log("collect money 2")
        console.log(response.isOperationSuccess());
        console.log(response.isTransactionSuccess());
    } catch (e) {
        console.log("collect money 3 errr", e)
    }
}
exports.Votes = async (req, res) => {
    try {
        let { name,
            email,
            classe,
            candidate,
            election,
            // position,
        } = req.body
        // console.log("in votes",position)
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        let voterModel = {
            name: name,
            email: email,
            class: classe,
            candidate: candidate,
        }

        // let inSchool = await isPointInZone(position, {
        //     minLatitude: 3.812688872322855,
        //     minLongitude: 11.55732362354677,
        //     maxLatitude: 3.8140805329527545,
        //     maxLongitude: 11.559480119615515
        // })
        // console.log(inSchool)
        // console.log(position)
        // if (inSchool) {

        let votes = {
            candidate: candidate,
            doneOn: new Date,
            election: election,
            // doneAt: position,
        }
        const elections = await Election.findOne({ _id: election });
        // console.log(elections)
        if (elections) {
            if (elections.status !== 'END') {
                if (elections.status !== 'READY') {
                    let verificationCode = ''
                    for (let i = 0; i < 6; i++) {
                        let temp = Math.floor(Math.random() * 10)
                        verificationCode += temp
                    }
                    const voters = await Voter.findOne({
                        'name': name.toUpperCase(),
                        // 'email': email.toLowerCase(),
                        'class': classe.toUpperCase(),
                    });
                    // console.log(votes)
                    if (voters) {
                        if (voters.email !== email.toLowerCase()) {
                            let emailUsed = await Voter.findOne({ email: email.toLowerCase() })
                            if (emailUsed) {
                                return res.status(400).json({ message: 'email already used to voted' })
                            }
                        }
                        if (voters.status.toLowerCase() !== 'voted') {
                            voters.votes = votes;
                            voters.verificationCode = verificationCode;
                            voters.verificationTime = new Date;
                            // console.log("token", token)
                            if (token) {
                                try {
                                    const decoded_user_payload = jwt.verify(token, 'mytoken');
                                    let login = await Admin.findOne({
                                        '_id': decoded_user_payload.id,
                                        'name': decoded_user_payload.name,
                                        'token': token,
                                    });
                                    console.log("login", login)
                                    if (login) {
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
                                    } else {
                                        console.log("not login")
                                        return res.status(404).json({ message: 'you session has exprie', statusLogin: true });
                                    }
                                } catch (err) {
                                    console.log(err)
                                    return res.status(400).json({ message: 'you session has exprie', statusLogin: true });
                                }
                            } else {
                                voters.email = email
                                voters.class = classe
                                voters.votes.approvedby = 'ONLINE'
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
                                            to: email.toLowerCase(),
                                            subject: 'Please comfrim you votes for AICS comel election',
                                            // html: mailMessages('create-personnel', { randomPassword, name }),
                                            // html: `<h1>Ander</h1>`,
                                            text: `Your verification code for comel election is ${verificationCode}`,
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
                                        return res.status(400).json({ message: 'check you connection email' });
                                    })
                            }
                        } else {
                            return res.status(400).json({ message: 'already Voted' });
                        }
                    } else {
                        console.log('you are not Voter')
                        return res.status(400).json({ message: 'incorrect matricule' });
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
                } else {
                    return res.status(400).json({ message: 'Elections not yet start' });
                }
            } else {
                return res.status(400).json({ message: 'Elections ended' });
            }
        } else {
            return res.status(400).json({ message: 'Elections ended' });
        }
        // } else {
        //     return res.status(406).json({ message: 'you are not on campus', statusAdmin: true });
        // }
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
        if (!parseInt(code)) {
            return res.status(400).json({ message: 'the verification code is a number' });
        }
        const voters = await Voter.findOne({
            'name': name.toUpperCase(),
            'email': email.toLowerCase(),
            // 'class': classe.toUpperCase(),
            'verificationCode': code,
        });
        // console.log(voters);
        if (voters) {
            let duration = moment().diff(moment(voters.verificationTime), 'minutes')
            console.log("duration in mins", duration);
            if (duration < 10) {
                if (voters.status.toLowerCase() !== 'voted') {
                    voters.status = "VOTED";
                    await voters.save()
                        .then(async respond => {
                            console.log(respond)
                            return res.status(200).json({ message: "you voted have be accepted", statusAdmin: true });
                        })
                        .catch(err => {
                            return res.status(400).json({ message: 'check you connection' });
                        })
                } else {
                    return res.status(400).json({ message: 'Already voted', statusError: true });
                }
            } else {
                return res.status(400).json({ message: 'you code has expired', statusError: true });
            }
        } else {
            return res.status(400).json({ message: 'Invalid code' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.VotesByAdmin = async (req, res) => {
    try {
        // console.log(req.body)
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
// const getAuthorization = (method, endpoint, date, nonce, headers, body) => {
//     if (headers === void 0) { headers = {}; }
//     var url = this._buildUrl(endpoint);
//     var credentials = { accessKey: this.accessKey, secretKey: this.secretKey };
//     return Signature_1.Signature.signRequest('payment', method, url, date, nonce, credentials, headers, body || {});
// };
exports.VotesNTimes = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        // console.log(authHeader)
        const token = authHeader && authHeader.split(' ')[1];
        console.log(req.body)
        // const decoded_user_payload = jwt.verify(token, 'mytoken');
        // console.log("decoded_user_payload", decoded_user_payload);
        // const id = decoded_user_payload.id;
        const id = "testid";
        let {
            phone,
            payment,
            candidate,
            election
        } = req.body
        // const elections = await Election.findOne({ _id: election });
        // if (elections) {
        //     if (elections.status !== 'END') {
        //         if (elections.status !== 'READY') {
        //             const voter = await Voter.findOne({
        //                 'voterId': id,
        //                 'election': election,
        //             });
        //             console.log(voter);
        //             if (voter) {
        //                 return res.status(400).json({ message: 'You have already voted', statusError: true });
        //             } else {
        console.log("voter creating")
        const voters = new Voter({
            voterId: id,
            election: election,
            candidate: candidate,
            TransactionId: 'test',
        })

        try {
            const attemptPayment = async (id) => {
                try {
                    var myHeaders = {
                        'Authorization': 'Token c41627139421ae9347ee7f8b0944535d26660aad',
                        'Content-Type': 'application/json'
                    }

                    const response = await fetch(`https://demo.campay.net/api/transaction/${id}/`, {
                        method: "GET",
                        // body: bodyContent,
                        headers: myHeaders
                    })
                        .then(response => response.json())
                        .then(result => {
                            console.log("result", result);
                            return result;
                        })
                        .catch(error => {
                            console.log('error', error)
                            return {
                                success: false,
                                status: "FAILED",
                            };
                        });
                    return response
                } catch (err) {
                    console.log(err);
                    return {
                        success: false,
                        status: 'FAILED',
                    };
                }
            }




            const headersList = {
                'Authorization': 'Token c41627139421ae9347ee7f8b0944535d26660aad',
                'Content-Type': 'application/json'
            }

            const bodyContent = JSON.stringify({
                "amount": "5",
                "from": "237652156526",
                // "from": "237659035317",
                "description": "Test",
                "external_reference": ""
            });

            try {
                const response = await fetch("https://demo.campay.net/api/collect/", {
                    method: "POST",
                    body: bodyContent,
                    headers: headersList
                });
                const paymentStatusResponse = await response.json();
                console.log(paymentStatusResponse)
                let transID = paymentStatusResponse.reference
                let attempts = 0; // Initialize attempts counter outside the interval
                let maxAttempts = 20; // Set maximum attempts

                const intervalId = setInterval(async () => {
                    attempts++;
                    console.log("time to do Num:", attempts)
                    if (attempts > maxAttempts) {
                        clearInterval(intervalId)
                        return res.status(400).json({ message: 'Transaction Failed', statusTrans: true });
                    }
                    let payResponse = await attemptPayment(transID);
                    if (payResponse) {
                        console.log("payResponse", attempts, " ", payResponse.status)
                        let status = payResponse.status
                        if (status === 'FAILED') {
                            clearInterval(intervalId)
                            return res.status(200).json({
                                message: payResponse.reason,
                                // payResponse: payResponse,
                                statusTrans: true
                            });
                        }
                        if (status === 'SUCCESSFUL') {
                            clearInterval(intervalId)
                            console.log("payResponse", payResponse)
                            return res.status(200).json({ 
                                message: "accept successful",
                                statusTrans: payResponse
                             });
                        }
                    }
                }, 5000);
                console.log("intervalId", intervalId);
                return res.status(200).json({ statusTrans: intervalId });
            } catch (error) {
                console.error("Error polling payment status:", error);
                return {
                    success: false,
                    error: error.message // Or a custom error code if relevant  
                };
            }


            // setTimeout(async () => {

            // }, 20000);
        } catch (e) {
            console.log(e)
            if (e.code)
                return res.status(409).json({ error: e, message: e.code, statusTrans: true });
            else
                return res.status(409).json({ error: e, message: "timed out error", statusTrans: true });
        }

        //             }
        //         } else {
        //             return res.status(400).json({ message: 'Elections not yet start', statusError: true });
        //         }
        //     } else {
        //         return res.status(400).json({ message: 'Elections ended', statusError: true });
        //     }
        // } else {
        //     return res.status(400).json({ message: 'Elections ended', statusError: true });
        // }
    } catch (err) {
        console.log(err)
        return res.status(410).json({ message: "logout", login: true });
    }
}
/*
    if (voters) {
            if (voters.status.toLowerCase() !== 'voted') {
                voters.votes = votes;
                voters.verificationCode = verificationCode;
                voters.verificationTime = new Date;
                if (token) {
                    try {
                        const decoded_user_payload = jwt.verify(token, 'mytoken');
                        let login = await Admin.findOne({
                            '_id': decoded_user_payload.id,
                            'name': decoded_user_payload.name,
                            'token': token,
                        });
                        console.log("login", login)
                        if (login) {
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
                        } else {
                            console.log("not login")
                            return res.status(404).json({ message: 'you session has exprie', statusLogin: true });
                        }
                    } catch (err) {
                        console.log(err)
                        return res.status(400).json({ message: 'you session has exprie', statusLogin: true });
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
                                to: email.toLowerCase(),
                                subject: 'Please comfrim you votes for AICS comel election',
                                // html: mailMessages('create-personnel', { randomPassword, name }),
                                // html: `<h1>Ander</h1>`,
                                text: `Your verification code for comel election is ${verificationCode}`,
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
                            return res.status(400).json({ message: 'check you connection email' });
                        })
                }
            } else {
                return res.status(400).json({ message: 'already Voted', statusAdmin: true });
            }
        } else {
            console.log('you are not Voter')
            return res.status(400).json({ message: 'incorrect matricule', statusAdmin: true });
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
*/