/* 
right now only for single player part, websocket/ multiplayer will be resolved next week 
status: websocket is implemented, available interaction:
	send definition,
	check answer
	
plan: since it's multiplayer, the entire game would be hosted serverside, so:
	a timer for each question,
	broadcast when somebody disconnects,
	keeping track of scores
*/

const express = require("express");
const axios = require("axios");
const websocket = require("ws").Server; 

app = express();

const port = 3000;
const hostname = "localhost";

app.use(express.json());

let wordPool, word, exampleSentence, definition = "";
let difficulty, amount;
let diffMult = {easy: 1.0, medium: 1.25, hard: 1.5}

//test word pool
wordPool = ["language", "why", "pneumonoultramicroscopicsilicovolcanoconiosis"];
setNextWord();
app.get("/singleplayer", function (req, res){
	diff = req.query.difficulty;
	amount = req.query.amount;
	
	if (req.query.hasOwnProperty("difficulty") && req.query.hasOwnProperty("amount")){
	}
	difficulty = diffMult[diff];
	// TODO: query the wordpool
	wordPool = getWordPool();
	setNextWord();
});

app.get("/answer", function(req, res){
	let answer = req.query.answer;
	
	if (word == answer){
		setNextWord();
		res.json({correct: true, nextWord: word});
		return;
	}
	
	res.json({correct: false});
});

app.get("/nextword", function (req, res){
	setNextWord();
	res.send({word: word});
});

app.get("/definition", function (req, res){
	res.json({definition: definition});
});

app.get("/example", function (req, res){
	res.json({example: exampleSentence});
});

function getWordPool(){
	//query from mongoDB
	// randomize the array also
	
	
	return []; // should return an array of words
}

function setNextWord(){
	word = wordPool.shift();
	
	//get data features
	var options = {
	  method: 'GET',
	  url: `https://wordsapiv1.p.rapidapi.com/words/${word}`,
	  headers: {
		'x-rapidapi-key': 'dc87df349dmshdec7c11cbfce208p18ad3bjsn6b8b45632120',
		'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com'
	  }
	};

	axios.request(options).then(function (response) {
		console.log(response.data.results[0].examples);
		if (response.data.results == null){
			throw "no definition";
		}
		definition = response.data.results[0].definition;
		exampleSentence = response.data.results[0].examples[0];
	}).catch(function (error) {
		definition = "not available";
		console.log(`no definition for word '${word}' available`);
	});

}

app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});

//=============================Web Socket portion======================================
//status: right
const wsServer = new websocket({
	port: 80
});

wsServer.on('connection', function (ws){
	ws.on('message', function (message){
		console.log('received: %s', message);
		let command = JSON.parse(message);
		data = execute(command);
		
		ws.send(JSON.stringify(data)); 
	});
});

function execute(command){
	var data = {};
	if (command.type == "help"){
		switch (command.data) {
			case "definition":
				data.type = "definition";
				data.data = definition;
				break;
			case "exampleSen":
				data.type = "exampleSen";
				data.data = exampleSentence;
				break;
			default:
				data.type = "wut";
				data.data = "";
				break;
		}
	}
	
	if (command.type == "answer"){
		data.type = "answerCheck"
		if (command.data == word){
			data.data =  "correct";
		}
		data.data = "not correct";
	}
	
	return data;
}

