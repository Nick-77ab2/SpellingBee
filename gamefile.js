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

const axios = require("axios");
const websocket = require("ws"); 
const env = require('./env.json');
const MongoClient = require('mongodb').MongoClient;

const mongo_username = env.MONGO_USERNAME;
const mongo_password = env.MONGO_PASSWORD;
const api_key = env.API_KEY;
const connectURL = `mongodb+srv://${mongo_username}:${mongo_password}@groupwork.7ykyi.mongodb.net/spelling_bee?retryWrites=true&w=majority`;


let wordPool, word, exampleSentence, definition = "";
let difficulty, amount;
let diffMult = {easy: 1.0, medium: 1.25, hard: 1.5}

//test word pool
wordPool = ["language", "why", "pneumonoultramicroscopicsilicovolcanoconiosis"];

const wsServer = new websocket.Server({
	port: 80
});

let currentPlayers = {};
let userid = 0; //TODO: integrate with user logging feature
wsServer.on('connection', function (ws){
	console.log(Object.keys(currentPlayers).length);
	if (Object.keys(currentPlayers).length == 3){
		ws.send(JSON.stringify({type: "broadcast", data: "maximum amount of players (3 players) reached, no more connection will be allowed"}));
		ws.terminate();
		return;
	}
	
	
	userid++; //TODO: integrate with user logging feature
	currentPlayers[userid] = ws;
	//broadcast whenever new player join
	broadcast(`Player ${userid} joined`);
	
	ws.on('message', function (message){
		console.log('received: %s from %s', message);
		let command = JSON.parse(message);
		data = execute(command);
		
		ws.send(JSON.stringify(data)); 
	});
});

function broadcast(message, isNewWord = false){
	let type = "broadcast";
	if (isNewWord){
		type = "newWord";
	}
	wsServer.clients.forEach(function each(client){
		if (client.readyState === websocket.OPEN) {
			client.send(JSON.stringify({type: type, data: message}));
		};
	});
}

function getWordPool(difficulty, amount){
	// query from mongoDB
	// randomize the array also
	
	let result = [];
	
	let client = new MongoClient(connectURL, { useNewUrlParser: true, useUnifiedTopology: true });
	let level = "easy";
	
	client.connect(function (error){
		const wordsCollection = client.db('spelling_bee').collection('words');
		// randomly grab from database
		wordsCollection.aggregate([
                { $match: { "difficulty": difficulty } },
                { $sample: { size: 10 } },
                { $project: { "word": 1, "_id": 0 } },
            ]).toArray()
                .then(function (data) {
                    data.forEach(function (value, index) {
						result.push({ word: value.word });
                    });
                    console.log(result);
                })
                .catch(function (error) {
                    console.log("error");
                });
	});
	
	return result; // should return an array of words
}

function setNextWord(){
	word = wordPool.shift();
	
	//get data features
	var options = {
	  method: 'GET',
	  url: `https://wordsapiv1.p.rapidapi.com/words/${word}`,
	  headers: {
		'x-rapidapi-key': '9911185b87msh3626b8edbef5d2fp18ab6djsn1f010e49de4d',
		'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com'
	  }
	};

	axios.request(options).then(function (response) {
		let error = {definition: false, example: false};
		let isError = false;
		if (response.data.results == null){
			isError = true;
			error.defintion =  true;
			error.example = true;
		}
		
		if (response.data.results[0].defintion == null) {
			isError = true;
			error.defintion =  true;
		}
		
		if (response.data.results[0].examples == null){
			isError = true;
			error.example =  true;
		}
		
		if (!error.defintion){
			definition = response.data.results[0].definition;
		}
		
		if (!error.example){
			exampleSentence = response.data.results[0].examples[0];
		}
		
		if (isError){
			throw error;
		}
	}).catch(function (error) {
		if (error.definition){
			definition = "not available";
			console.log(`no definition for word '${word}' available`);
		}
		
		if (error.example){
			exampleSentence = "not available";
			console.log(`no example sentence for word '${word}' available`);
		}
		
	});
	
	//broadcast for all players to know
	broadcast(word, true);
}

function execute(command){
	var data = {};
	if (command.type == "help"){
		switch (command.data) {
			case "definition":
				data.type = "definition";
				if (definition == ""){
					data.available = false;
				} else {
					data.available = true;
				}
				data.data = definition;
				break;
			case "exampleSen":
				data.type = "exampleSen";
				if (definition == ""){
					data.available = false;
				} else {
					data.available = true;
				}
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
			data.data =  true;
			setNextWord();
		}
		data.data = false;
	}
	return data;
}

function incCount(){
	count++;
	if (count > 3) {
		count = 0;
	}
}
