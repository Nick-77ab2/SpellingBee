/* 
right now only for single player part, websocket/ multiplayer will be resolved next week 

*/

const express = require("express");
const axios = require("axios");
const websocket = require("ws"); 

app = express();

const port = 3000;
const hostname = "localhost";

app.use(express.json());

let wordPool, word;
let difficulty, amount;
let diffMult = {easy: 1.0, medium: 1.25, hard: 1.5}

//test word pool
wordPool = ["language", "why", "pneumonoultramicroscopicsilicovolcanoconiosis"];
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
	var options = {
	  method: 'GET',
	  url: `https://wordsapiv1.p.rapidapi.com/words/${word}`,
	  headers: {
		'x-rapidapi-key': 'dc87df349dmshdec7c11cbfce208p18ad3bjsn6b8b45632120',
		'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com'
	  }
	};

	axios.request(options).then(function (response) {
		console.log(response.data);
		if (response.data.results == null){
			throw "no definition";
		}
		res.json({definition: response.data.results[0].definition});
	}).catch(function (error) {
		res.json({definition: "not available"});
	});
});

function getWordPool(){
	//query from mongoDB
	// randomize the array also
	
	
	return []; // should return an array of words
}

function setNextWord(){
	word = wordPool.shift();
}

/*
function calculatePoints(answer){
	percentage = _lev(answer, word);
	return percentage * difficulty; //TODO: truncate to int
}


function _lev(a, b){
	//levenshtein distance, returns the edit distance between the two words 
	function tail(word){
		return word.substring(1, word.length)
	}
	
	if (a.length = 0) return b.length;
	if (b.length = 0) return a.length;
	if (a[0] = b[0]){
		return _lev(tail(a), tail(b));
	}

	return Math.min([
		_lev(tail(a), b),
		_lev(a, tail(b)),
		_lev(tail(a), tail(b))
	]);
}
*/

app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});

/* 

// URL format: wordsapiv1.p.rapidapi.com/words/%7B${word}%7D
// stop users from overaccessing the database.
*/