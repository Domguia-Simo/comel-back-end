const express = require('express');
const bodyParser = require('body-parser')
var multer = require('multer')

var app = express();
 app.use(bodyParser.urlencoded({extended:false}))
var multer =  multer({dest:'/tmp/'})

const data1 = [
    {id:1,name:"Domguia"},
    {id:1,name:"Simo"},
    {id:1,name:"Ulrich"},
]

//It enable to load a file on this port.Eg a web page 
app.use(express.static('./'))

app.get('/' ,(request ,respond)=>{
    respond.send("Simo")

})
// console.log(bodyParser.urlencoded)


app.get('/index' , (request ,respond)=>{
    respond.send("responding on the home page");

})

app.post('/verify_form' ,multer, (req ,res)=>{
    // var file = req.files.pic
    // console.log(file)
    var result = {
        fname:req.body.fname,
        lname:req.body.lname,
    }
    // res.send(result);
    if(result.fname == "Simo" && result.lname == "Ulrich"){
        res.send(result)
        // res.end(JSON.stringify(result))

    }else{
        res.sendFile(__dirname+"/"+"test.html")

    }

})

var server = app.listen(8001 ,()=>{
    var host = server.address().address
    host = '0.0.0.0';
    var port = server.address().port;
    // console.log(server.address())
    console.log("Server with express running on : http://%s:%s" ,host ,port)
})

