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
const websocket = require("ws"); 
const env = require('./env.json');
const MongoClient = require('mongodb').MongoClient;

const mongo_username = env.MONGO_USERNAME;
const mongo_password = env.MONGO_PASSWORD;
const api_key = env.API_KEY;
const connectURL = `mongodb+srv://${mongo_username}:${mongo_password}@groupwork.7ykyi.mongodb.net/spelling_bee?retryWrites=true&w=majority`;


app = express();
hostname = "localhost";
port = 3000;
app.use(express.json());

let wordPool, word, exampleSentence, definition = "";
let difficulty, amount;
let diffMult = {easy: 1.0, medium: 1.25, hard: 1.5}


//=====================DB managing stuff=========================================
/* all the DB managing functions and handles such as adding, deleting, changing DB should be implemented here */




//==================Singleplayer stuff===========================================
//test word pool
wordPool = ["language", "why", "pneumonoultramicroscopicsilicovolcanoconiosis"];
//setNextWord();
app.get("/singleplayer", function (req, res){
	diff = req.query.difficulty;
	amount = parseInt(req.query.amount);
	
	if (req.query.hasOwnProperty("difficulty") && req.query.hasOwnProperty("amount")){
	}
	difficulty = diffMult[diff];
	// TODO: query the wordpool
	wordPool = getWordPool(diff, amount);
	console.log(wordPool); 
	setNextWord();
	res.send();
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
const wsServer = new websocket.Server({
	port: 80
});
let count = 0;

wsServer.on('connection', function (ws){
	incCount();
	userid = count;
	//broadcast whenever new player join
	wsServer.clients.forEach(function each(client){
		console.log(websocket.OPEN);
		if (client.readyState === websocket.OPEN) {
			client.send(JSON.stringify({type: "broadcast", data: `Player ${userid} has joined`}));
		};
	});
	
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

function incCount(){
	count++;
	if (count > 3) {
		count = 0;
	}
}
