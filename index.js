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
const Voter = require("./src/models/voter");
const Admin = require('./src/models/Admin.js')
const Election = require('./src/models/Election.js')
const { v4: uuidv4 } = require('uuid');


var app = express();

// const allowedOrigins = [
//     'http://localhost:3000', // Localhost for development
//     'localhost:5000', // Localhost for development
//     // 'https://web.campusiai.com',   // Replace with your production domain
//     // 'bk.campusiai.com',   // Replace with your production domain
// ];

// CORS options
// const corsOptions = {
//     origin: function (origin, callback) {
//         if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     methods: ["GET", "POST", "DELETE", "PATCH", "PUT"]
// };
// app.use(cors(corsOptions));
// app.use(cors({
//     origin: '*', // Specific allowed origin
//     // origin: 'https://www.example.com', // Specific allowed origin
//     // Other options for methods, headers, etc.
// }));
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Utility function for sleeping

let url = "mongodb+srv://anderson:Ander123@cluster0.a8nau1r.mongodb.net/E-voting"

mongoose.connect(url)
    .then((con) => {
        console.log("Connected to the db")
    }
    )
    .catch(err => { console.log(err) })


app.get("/", (req, res) => {
    return res.send("Welcome to comel backend")
})
app.post("/api/payment", async (req, res) => {
    let {
        phone,
        candidate,
        election
    } = req.body
    const elections = await Election.findOne({ _id: election });
    if (elections) {
        if (elections.status !== 'END') {
            if (elections.status !== 'READY') {
                const headersList = {
                    'Authorization': 'Token c41627139421ae9347ee7f8b0944535d26660aad',
                    'Content-Type': 'application/json'
                }
                const bodyContent = JSON.stringify({
                    "amount": "5",
                    // "from": "237659035317",
                    // "from": "237673962005",
                    "from": phone,
                    // "from": "237652156526",
                    "description": "Paying to voted" + candidate,
                    "external_reference": uuidv4()
                });
                try {
                    const response = await fetch("https://demo.campay.net/api/collect/", {
                        method: "POST",
                        body: bodyContent,
                        headers: headersList
                    });
                    const paymentStatusResponse = await response.json();
                    console.log("paymentStatusResponse", paymentStatusResponse)
                    return res.status(200).json(paymentStatusResponse)

                } catch (error) {
                    console.error("Error initialing payment:", error);
                    return res.status(400).send({ message: "Transaction failed please start back", statusError: true })
                }

            } else {
                return res.status(400).json({ message: 'Elections not yet start', statusError: true });
            }
        } else {
            return res.status(400).json({ message: 'Elections ended', statusError: true });
        }
    } else {
        return res.status(400).json({ message: 'Elections ended', statusError: true });
    }
})
app.put("/api/verify/:id", async (req, res) => {
    let {
        phone,
        payment,
        candidate,
        election
    } = req.body
    const headersList = {
        'Authorization': 'Token c41627139421ae9347ee7f8b0944535d26660aad',
        'Content-Type': 'application/json'
    }
    try {
        const response = await fetch(`https://demo.campay.net/api/transaction/${req.params.id}/`, {
            method: "GET",
            headers: headersList
        })
        const paymentStatusResponse = await response.json();
        if (paymentStatusResponse.status === "SUCCESSFUL") {
            console.log(req.body);
            const voters = new Voter({
                voterId: paymentStatusResponse.external_reference,
                election: election,
                candidate: candidate,
                TransactionId: paymentStatusResponse.reference,
            })
            await voters.save();
        }
        return res.status(200).json(paymentStatusResponse)
    } catch (error) {
        console.error("Error polling payment status:", error);
        return res.status(500).json({ message: "Server error" })
    }
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
        let { id, name } = decoded_user_payload
        let login = await Admin.findOne({
            '_id': id,
            'name': name,
            'token': token,
        });
        if (login) {
            req.UserName = name;
            req.Id = id;
            return res.status(200).json({ isLogin: true, name: name });
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
        let { id, name } = decoded_user_payload
        let login = await Admin.findOne({
            '_id': id,
            'name': name,
            'token': token,
            'accountType': "SuperAdmin",
        });
        if (login) {
            req.UserName = name;
            req.Id = id;
            return res.status(200).json({ isAdmin: true, name: name });
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
// const serverio = new Server(server, {
//     maxHttpBufferSize: 1e8,
//     cors: corsOptions
// });
// serverio.on('connection', (socket) => {
//     socket.on('paymentStatusBack', async (data) => {
//         // socket.emit('updateCandidateMarkFrontError', data);
//         try {
//             var myHeaders = {
//                 'Authorization': 'Token c41627139421ae9347ee7f8b0944535d26660aad',
//                 'Content-Type': 'application/json'
//             }

//             const response = await fetch(`https://demo.campay.net/api/transaction/${data.transId}/`, {
//                 method: "GET",
//                 // body: bodyContent,
//                 headers: myHeaders
//             })
//                 .then(response => response.json())
//                 .then(result => {
//                     console.log("result", result);
//                     return result;
//                 })
//                 .catch(error => {
//                     console.log('error', error)
//                     return {
//                         success: false,
//                         status: "FAILED",
//                     };
//                 });
//             console.log(response);
//         } catch (err) {
//             // console.log("error", err);
//             // console.log("error23");
//             socket.emit('paymentFailed', data);
//         }

//     });
//     socket.on('disconnect', () => {
//         console.log('User disconnected');
//     });
// })
