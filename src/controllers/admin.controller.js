const adminModel = require('../models/Admin.js')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const validator = require('validator');
const nodemailer = require("nodemailer");
const moment = require("moment");

const login = async (req, res) => {
    try {
        let { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password must be provided.' });
        }
        let admin = await adminModel.findOne({ email: email.toLowerCase() })
        // console.log(admin)
        if (admin == null) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }
        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        let token = jwt.sign({ id: admin._id, email: admin.email, accountType: admin.accountType }, 'mytoken')
        // console.log(token)
        let verificationCode = ''
        for (let i = 0; i < 6; i++) {
            let temp = Math.floor(Math.random() * 10)
            verificationCode += temp
        }
        // console.log(verificationCode);
        admin.code = verificationCode;
        admin.verificationTime = new Date;
        admin.token = token;
        admin.save()
            .then(async (result) => {
                if (admin.status)
                    return res.status(200).json({ message: 'login successful', name: admin.name, token: token, status: true })
                else {
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
                        subject: "verifier voter compte sur iai award de l'excellence",
                        text: `Voter code de Verification sur notre plateforme est le ${verificationCode}`,
                    };
                    await transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return res.status(409).json({ message: 'check you connection', isLogin: true });
                        } else {
                            return res.status(200).json({ message: 'login successful', name: admin.name, token: token, status: false })
                            // return res.status(200).json({ message: "a mail have been send to you confrim it", isLogin: true, statusAdmin: true });
                        }
                    });
                }

            })
            .catch((err) => {
                return res.status(401).json({ message: 'check your connection' })
            })


    }
    catch (e) {
        // console.log(e)
        return res.status(500).json({ error: 'server error' })
    }

}
const register = async (req, res) => {
    try {
        let { name, email, password, confirmPassword } = req.body
        // console.log(req.body)
        if (!validator.isEmail(email)) {
            return res.status(400).send({ message: 'Invalid email.' });
        }
        const existingAdmin = await adminModel.findOne({ 'email': email });
        if (existingAdmin) {
            return res.status(409).send({ message: 'Admin Email already in use.' });
        }

        // Password validation
        if (password.length < 8) {
            return res.status(400).send({ message: 'Password must be at least 8 characters.' });
        }
        if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
            return res.status(400).send({ message: 'Password must contain at least one lowercase letter, one uppercase letter, and one digit.' });
        }
        if (password !== confirmPassword) {
            return res.status(400).send({ message: 'Passwords do not match.' });
        }
        const hash = await bcrypt.hash(password, 9);
        let admin = new adminModel({
            // name: name.toLowerCase(),
            email: email.toLowerCase(),
            password: hash
        })
        admin.save()
            .then(async respond => {
                return res.status(200).json({ message: 'Voter created successfully' })
            })
            .catch(err => {
                return res.status(409).json({ message: 'check you connection' });
            })

    }
    catch (e) {
        // console.log(e)
        return res.status(500).json({ error: 'server error' })
    }

}
const verfiyAdmin = async (req, res) => {
    try {
        let {
            code
        } = req.body
        if (!parseInt(code)) {
            return res.status(400).json({ message: 'the verification code is a number' });
        }
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        // console.log(token)
        if (!token) {
            return res.status(200).json({ message: 'Your session has expire', isLogin: false });
        }

        const decoded_user_payload = jwt.verify(token, 'mytoken');
        let { id, email } = decoded_user_payload
        let admin = await adminModel.findOne({
            '_id': id,
            'email': email,
            'token': token,
            'code': code
        });
        console.log(decoded_user_payload)
        if (admin) {
            let duration = moment().diff(moment(admin.verificationTime), 'minutes');
            if (duration < 10) {
                admin.status = true
                await admin.save()
                    .then(async respond => {
                        return res.status(200).json({ message: "you account have be verify successfully", statusAdmin: true, isLogin: true });
                    })
                    .catch(err => {
                        return res.status(400).json({ message: 'check you connection', isLogin: true, statusError: true });
                    })
            } else {
                return res.status(400).json({ message: 'you code has expired', isLogin: true, statusError: true });
            }
        } else {
            return res.status(400).json({ message: 'Invalid code', isLogin: true, statusError: true });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', statusError: true, isLogin: false });
    }
}
const sendCode = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(200).json({ message: 'Your session has expire', isLogin: false });
        }

        const decoded_user_payload = jwt.verify(token, 'mytoken');
        let { id, email } = decoded_user_payload
        console.log(decoded_user_payload)
        let admin = await adminModel.findOne({
            '_id': id,
            'email': email,
            'token': token,
        });
        if (admin) {
            let verificationCode = ''
            for (let i = 0; i < 6; i++) {
                let temp = Math.floor(Math.random() * 10)
                verificationCode += temp
            }
            console.log(verificationCode);
            admin.code = verificationCode;
            admin.verificationTime = new Date;
            await admin.save()
                .then(async respond => {
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
                        subject: "verifier voter compte sur iai award de l'excellence",
                        text: `Voter code de Verification sur notre plateforme est le ${verificationCode}`,
                    };
                    await transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return res.status(409).json({ message: 'check you connection', isLogin: true });
                        } else {
                            return res.status(200).json({ message: "a mail have been send to you confrim it", isLogin: true, statusAdmin: true });
                        }
                    });
                })
                .catch(err => {
                    console.log(err)
                    return res.status(400).json({ message: 'check you connection', isLogin: true });
                })
        } else {
            return res.status(400).json({ message: 'Your session has expire', isLogin: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }

}
const registerAdmin = async (req, res) => {
    try {
        let { name, email, password } = req.body
        // console.log(req.body)
        const existingAdmin = await adminModel.findOne({ 'email': email });
        if (existingAdmin) {
            return res.status(409).send({ message: 'Admin Email already in use.' });
        }
        let admin = await adminModel.findOne({ _id: req.Id })
        if (admin) {
            if (admin.accountType === "SuperAdmin") {
                const hash = await bcrypt.hash(password, 9);
                let admin = new adminModel({
                    name: name.toLowerCase(),
                    email: email.toLowerCase(),
                    password: hash
                })
                admin.save()
                    .then(respond => {
                        // console.log(respond)
                        return res.status(200).json({ message: 'admin created successfully' })
                    })
                    .catch(err => {
                        // console.log(err)
                        return res.status(409).json({ message: 'check you connection' });
                    })
            } else {
                return res.status(400).json({ message: 'Acess Denied' });
            }
        } else {
            return res.status(400).json({ message: 'Acess Denied' });
        }
    }
    catch (e) {
        // console.log(e)
        return res.status(500).json({ error: 'server error' })
    }

}
const getAllUsers = async (req, res) => {
    try {
        const admins = await adminModel.find();
        return res.status(200).json({ admins: admins });
    } catch (error) {
        // console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { login, register, getAllUsers, sendCode, verfiyAdmin }