/*
this is the script that establish a connection to the server and offers functions that send datas to the server according to client needs

getDefinition(): server will return a definition contained in a JSON like this {type: "definition", available: true/false, data: <defintion>}
getExampleSentence(): server will return an example sentence contained in a JSON like this {type:"exampleSen", available: true/false, data: <exampleSen>}

sendAnswer(answer): server will broadcast a JSON like this to all clients {type:"answerCheck", correct: true/false}
*/

url = 'ws://localhost:80' //url of server here
var connection = new WebSocket('ws://localhost:80');

connection.onopen = function(){
	console.log('successfully connected to ' + url);
};

connection.onmessage = function (message) { 
	data = JSON.parse(message.data);
	console.log(message);
	switch (data.type) {
		case "definition":
			//TODO: change the following console.log to the correct command (display it in some HTML element)
			console.log(data.data);
			break;
		case "exampleSen":
			//TODO: change the following console.log to the correct command (display it in some HTML element)
			console.log(data.data);
			break;
		case "answerCheck":
			//TODO: change the following console.log to the correct command (display it in some HTML element)
			console.log(data.data);
			break;
		default:
			break;
	}
};

function getDefinition(){
	var command = {
		type: "help",
		data: "definition"
	};
	
	connection.send(JSON.stringify(command));
}

function getExampleSentence(){
	var command = {
		type: "help",
		data: "exampleSen"
	};
	
	connection.send(JSON.stringify(command));
}

function sendAnswer(answer){
	var command = {
		type: "answer",
		data: answer
	}
	
	connection.send(JSON.stringify(command));
}