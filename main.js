var http = require("http");

http.createServer(function(request,respond){
    respond.writeHead(200,{'Content-Type':'text/plain'})
    respond.end("Domguia Simo Ulich")
}).listen(8081);

console.log('My server is running on port number 8081')
// console.log(http)