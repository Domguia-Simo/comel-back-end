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
const { PaymentOperation, RandomGenerator } = require('./mesomb');

var app = express();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const DepositeMoney = async () => {

    const payment = new PaymentOperation({
        applicationKey: process.env.MESOMB_APPLICATION_KEY,
        accessKey: process.env.MESOMB_ACCESS_KEY,
        secretKey: process.env.MESOMB_SECRET_KEY
    });
    const response = await payment.makeDeposit({
        amount: 50,
        service: 'MTN',
        receiver: '652156526',
        nonce: RandomGenerator.nonce()
    });
    console.log(response.isOperationSuccess());
    console.log(response.isTransactionSuccess());
}

const collectMoney = async () => {
    const payment = new PaymentOperation({
        applicationKey: process.env.MESOMB_APPLICATION_KEY,
        accessKey: process.env.MESOMB_ACCESS_KEY,
        secretKey: process.env.MESOMB_SECRET_KEY
    });
    console.log("collect money 1")
    try {
        // console.log();
        // const application = await payment.getStatus();
        // console.log(application);
        const response = await payment.makeCollect({
            amount: 10,
            service: 'MTN',
            payer: '652156526',
            nonce: RandomGenerator.nonce()
        })
        console.log("collect money 2")
        console.log(response);
        console.log(response.isTransactionSuccess());

        
    } catch (e) {
        console.log("collect money 3 errr", e)
    }
}

const pollTransactionStatus = async (payment, transactionId) => {
    let transactionStatus;

    while (true) {
        try {
            const pollingResponse = await payment.getTransactionStatus(transactionId);
            transactionStatus = pollingResponse.getTransactionStatus();

            // Handle the transaction status accordingly
            if (transactionStatus === 'completed') {
                console.log('Transaction completed');
                break;
            } else if (transactionStatus === 'failed') {
                console.log('Transaction failed');
                break;
            }

            // Sleep for a certain period before making the next polling request
            await sleep(3000); // Adjust the polling interval as needed
        } catch (e) {
            console.log('Error occurred during transaction status polling:', e);
            break;
        }
    }
};

// Utility function for sleeping
const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
let url = "mongodb+srv://iai-sms:1nNl4MMt6gygBsYz@cluster0.sbmrul9.mongodb.net/comel"
// let url = "mongodb+srv://AndersonKamsong:Ander39@@@cluster0.9rlip3r.mongodb.net/"
// let url = "mongodb://127.0.0.1:27017/comel"

mongoose.connect(url)
    .then((con) => {
        console.log("Connected to the db")
    }
    )
    .catch(err => { console.log(err) })


app.get("/", (req, res) => {
    return res.send("Welcome to comel backend")
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
    // const headersList = {
    //     'x-mesomb-date': '1709648831992',
    //     'x-mesomb-nonce': '',
    //     'Content-Type': 'application/json',
    //     'X-MeSomb-Application': 'a0349a77eaee3156fea5c90a60c6ffe36928864f',
    //     'X-MeSomb-OperationMode': 'asynchronous',
    //     'Authorization': 'HMAC-SHA1 Credential=6cb46a23-5e19-4d89-8f3f-bd0e0ae102ce/202425/payment/mesomb_request, SignedHeaders=host;x-mesomb-date;x-mesomb-nonce, Signature=f3f14148337ee604567030ecde940a03b80e813a'
    // }

    // const bodyContent = JSON.stringify({
    //     "amount": 30,
    //     "payer": "652156526",
    //     "fees": true,
    //     "service": "MTN",
    //     "country": "CM",
    //     "currency": "XAF"
    // });

    // try {
    //     const response = await fetch("https://mesomb.hachther.com/api/v1.1/payment/collect/", {
    //         method: "POST",
    //         body: bodyContent,
    //         headers: headersList
    //     });
    //     console.log("response",response);
    //     const paymentStatusResponse = await response.json();
    //     console.log("paymentStatusResponse",paymentStatusResponse);
    //     // return res.status(200).json({
    //     //     message: "you voted have be accepted",
    //     //     status: paymentStatusResponse
    //     // });
    //     // Enhanced: Return More Informative Data
    //     // return {
    //     //     success: true,
    //     //     status: paymentStatusResponse.data.status,
    //     //     data: paymentStatusResponse.data // Include other available details  
    //     // };
    // } catch (error) {
    //     console.error("Error polling payment status test:", error);
    //     return {
    //         success: false,
    //         error: error.message // Or a custom error code if relevant  
    //     };
    // }
    await collectMoney();
    // await DepositeMoney();
})