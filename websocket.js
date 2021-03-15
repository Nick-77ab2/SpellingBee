const websocket = require("ws").Server;
//const http = require("http");

const port = 80;
//const hostname = "localhost";

//const server = http.createServer();
//server.listen(port);

const wsServer = new websocket({
	port: 80
});

let count = 0;
let definition = "glory to Lunix";
/*
wsServer.on('request', function (request) {
	count++;
	var userID = count;
	console.log((new Date()) + ' Received a new connection from origin ' + request.origin + '.');
	const connection = request.accept(null, request.origin);
	clients[userID] = connection;
	console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients));
});

wsServer.on('close', function (connection){
	delete clients[userID];
	console.log((new Date()) + ' player ' + userID + " disconnected.");
	ws.send(
});
*/


wsServer.on('connection', function (ws){
	ws.on('message', function (message){
		console.log('received: %s', message);
		let command = JSON.parse(message);
		data = execute(command);
		
		ws.send(data); 
	});
	
	ws.send('nice');
});

function execute(command){
	if (command.type == 'help'){
		switch (command.get) {
			case 'definition':
				return definition;
				break;
			default:
				return "not available";
				break;
		}
	}
}

