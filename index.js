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

var app = express();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


let url = "mongodb+srv://iai-sms:1nNl4MMt6gygBsYz@cluster0.sbmrul9.mongodb.net/comel"
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
        console.log(req.headers)
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(200).json({ isLogin: false });
        }

        const decoded_user_payload = jwt.verify(token, 'mytoken');
        let { id, name } = decoded_user_payload
        let test = await Admin.findOne({
            '_id': id,
            'name': name,
            // 'token': token,
        });
        console.log(test)
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
        const token = authHeader && authHeader.split(' ')[1];
        const decoded_user_payload = jwt.verify(token, 'mytoken');
        console.log("decoded_user_payload", decoded_user_payload);
        const id = decoded_user_payload.id;
        await adminModel.findOneAndUpdate({ '_id': id }, {
            'token': ''
        }).then((data)=>{
            console.log("logOut")
            return res.status(210).json({ message: "Logout successfully" });
        }).catch((err)=>{
            return res.status(410).json({ message: "check connection" });
        })
    } catch (err) {
        return res.status(410).json({ message: "logout" });
    }
})

app.get("*", (req, res) => {
    return res.send("Not found")
})


let server = app.listen(5000, () => {
    console.log("Server running on port 5000")
})