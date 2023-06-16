const http = require('http');
const fs = require('fs');

const data1 = [
    {id:1,name:"Domguia"},
    {id:1,name:"Simo"},
    {id:1,name:"Ulrich"},
]
var name = "Domguia Simo Ulrich"

http.createServer((request , respond)=>{
     var buffer = new Buffer()

    if(request.url == "/call"){

        respond.write(data1)
        respond.end();
    }else{
        respond.write("Nothing found here")
        respond.end();
    }
console.log(request.url)
}).listen(8001);

console.log("Server running on : http://127.0.0.1/8001")