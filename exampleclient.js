/*
this is the script that establish a connection to the server and offers functions that send datas to the server according to client needs

"broadcast" server message is basically server message send to all the players, should be displayed with a window or a dedicated place.

getDefinition(): server will return a definition contained in a JSON like this {type: "definition", available: true/false, data: <defintion>}
getExampleSentence(): server will return an example sentence contained in a JSON like this {type:"exampleSen", available: true/false, data: <exampleSen>}

sendAnswer(answer): server will broadcast a JSON like this to all clients {type:"answerCheck", data: true/false}
*/

url = 'ws://localhost:80' //url of server here
var connection = new WebSocket(url);

connection.onopen = function(){
	console.log('successfully connected to ' + url);
};

connection.onmessage = function (message) { 
	data = JSON.parse(message.data);
	console.log(message);
	switch (data.type) {
		case "definition":
			//TODO: change the following console.log to the correct command (display it in some HTML element)
			console.log("def:" + data.data);
			break;
		case "exampleSen":
			//TODO: change the following console.log to the correct command (display it in some HTML element)
			console.log("example: " + data.data);
			break;
		case "answerCheck":
			//TODO: change the following console.log to the correct command (display it in some HTML element)
			console.log("isTrue: " + data.data);
			break;
		case "broadcast":
			console.log("server msg: " + data.data);
			break;
		case "newWord":
			console.log("new word: " + data.data);
			break;
		default:
			console.log("something went wrong");
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