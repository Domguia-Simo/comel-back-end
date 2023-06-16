// var http = require("http");

// http.createServer(function(request,respond){
//     respond.writeHead(200,{'Content-Type':'text/plain'})
//     respond.end("Domguia Ulich")
// }).listen(8081);

// console.log('My server is running on port number 8081')
// // console.log(http)

var events = require('events');
var eventEmitter = new events.EventEmitter();

function connection(n){
    console.log("Connection Successfull" ,n);
    // console.log(n);

    eventEmitter.emit('reception');
}
function reception(){
    console.log("Reception of data successfull");

}

eventEmitter.addListener('connection' ,(n=12)=>connection(n))
eventEmitter.addListener('connection' ,reception)
let number = events.EventEmitter.listenerCount(eventEmitter ,'connection');
console.log(number);

eventEmitter.removeListener('connection' ,reception)
let num = events.EventEmitter.listenerCount(eventEmitter ,'connection');
console.log(num);

// eventEmitter.on('reception' ,reception);

eventEmitter.emit('connection');

// var fs = require('fs');

// fs.readFile('input.txt' ,(error ,data)=>{
//     if(error){
//         console.log(error.stack);
//     }else{
//         console.log(data.toString());
//     }

// })

console.log("Program Ended");