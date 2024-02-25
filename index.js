const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')

const electionRoutes = require('./src/routes/election.routes.js')
const adminRoutes = require('./src/routes/admin.routes.js')
const voterRoutes = require('./src/routes/voter.routes.js')
const candidateRoutes = require('./src/routes/candidate.routes.js')
const jwt = require('jsonwebtoken')
const adminModel = require('./src/models/Admin.js')
const Admin = require('./src/models/Admin.js')
const { PaymentOperation, RandomGenerator } = require('@hachther/mesomb');

var app = express();
const allowedOrigins = [
    'http://localhost:3000', // Localhost for development
    'localhost:5000', // Localhost for development
    'https://iai-award-de-lexcellence.vercel.app',   // Replace with your production domain
    'award-iai-bk.vercel.app',   // Replace with your production domain
];

// CORS options
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "DELETE", "PATCH", "PUT"]
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const DepositeMoney = async () => {

    const payment = new PaymentOperation({
        applicationKey: process.env.MESOMB_APPLICATION_KEY,
        accessKey: process.env.MESOMB_ACCESS_KEY,
        secretKey: process.env.MESOMB_SECRET_KEY
    });
    const response = await payment.makeDeposit({
        amount: 200,
        service: 'MTN',
        receiver: '651558567',
        nonce: RandomGenerator.nonce()
    });
    console.log(response.isOperationSuccess());
    console.log(response.isTransactionSuccess());
}
let url = "mongodb+srv://anderson:Ander123@cluster0.a8nau1r.mongodb.net/E-voting"

mongoose.connect(url)
    .then((con) => {
        console.log("Connected to the db")
    }
    )
    .catch(err => { console.log(err) })


app.get("/", (req, res) => {
    return res.send("Welcome to iai award backend")
})

app.use("/api/election", electionRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/voter', voterRoutes)
app.use('/api/candidate', candidateRoutes)
app.get('/api/isLogin', async (req, res) => {
    try {
        // console.log(req.headers)
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(200).json({ isLogin: false });
        }

        const decoded_user_payload = jwt.verify(token, 'mytoken');
        let { id, email } = decoded_user_payload
        let login = await Admin.findOne({
            '_id': id,
            'email': email,
            'token': token,
        });
        if (login) {
            req.UserEmail = email;
            req.Id = id;
            return res.status(200).json({ isLogin: true, email: email });
        } else {
            return res.status(200).json({ isLogin: false });
        }
    } catch (err) {
        console.log(err)
        return res.status(200).json({ isLogin: false });
    }

})
app.get('/api/logout', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        console.log(authHeader)
        const token = authHeader && authHeader.split(' ')[1];
        console.log(token)
        const decoded_user_payload = jwt.verify(token, 'mytoken');
        console.log("decoded_user_payload", decoded_user_payload);
        const id = decoded_user_payload.id;
        await adminModel.findOneAndUpdate({ '_id': id }, {
            'token': ''
        }).then((data) => {
            console.log("logOut")
            return res.status(210).json({ message: "Logout successfully" });
        }).catch((err) => {
            return res.status(410).json({ message: "check connection" });
        })
    } catch (err) {
        console.log(err)
        return res.status(410).json({ message: "logout" });
    }
})
app.get('/api/isAdmin', async (req, res) => {
    try {
        // console.log(req.headers)
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(200).json({ isLogin: false });
        }

        const decoded_user_payload = jwt.verify(token, 'mytoken');
        let { id, email } = decoded_user_payload
        let login = await Admin.findOne({
            '_id': id,
            'email': email,
            'token': token,
            'accountType':"SuperAdmin",
        });
        if (login) {
            req.UserEmail = email;
            req.Id = id;
            return res.status(200).json({ isAdmin: true, name: email });
        } else {
            return res.status(200).json({ isAdmin: false });
        }
    } catch (err) {
        console.log(err)
        return res.status(200).json({ isAdmin: false });
    }

})
app.get("*", (req, res) => {
    return res.send("Not found")
})


let server = app.listen(5000, async () => {
    console.log("Server running on port 5000");
    // await collectMoney();
    // await DepositeMoney();
})