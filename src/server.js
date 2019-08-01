var http = require("http");
const { spawn } = require('child_process')
var port = 8080;
// Create the server and listen to requests on the specified port.
http.createServer(function(request, response) {
    // Set the content type of the response
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    // Write a simple Hello NodeJS message,
    // which will be shown in the user's web browser
    response.end('Hello NodeJS!');
}).listen(port);