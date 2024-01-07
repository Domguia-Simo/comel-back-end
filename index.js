const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')

const electionRoutes =  require('./src/routes/election.routes.js')
const adminRoutes = require('./src/routes/admin.routes.js')


var app = express();
app.use(cors())
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())


let url="mongodb+srv://iai-sms:1nNl4MMt6gygBsYz@cluster0.sbmrul9.mongodb.net/comel"
mongoose.connect(url)
.then((con)=>{
        console.log("Connected to the db")
    }
)
.catch(err => {console.log(err)})


app.get("/",(req ,res)=>{
    return res.send("Welcome to comel backend")
})

app.use("/api/election",electionRoutes)
app.use('/api/admin' ,adminRoutes)

app.get("*" ,(req ,res)=>{
    return res.send("Not found")
})


let server = app.listen(5000 ,()=>{
    console.log("Server running on port 5000")
})