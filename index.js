let express = require('express');
let axios = require('axios');
let bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const env = require('./env.json');
const websocket = require("ws"); 
let app = express();

const MongoClient = require('mongodb').MongoClient;
const mongo_username = env.MONGO_USERNAME
const mongo_password = env.MONGO_PASSWORD
const port=env.PORT;
const uri = `mongodb+srv://${mongo_username}:${mongo_password}@groupwork.7ykyi.mongodb.net/spelling_bee?retryWrites=true&w=majority`;

let hostname = "localhost"

app.use(express.static('public_html'));

// parsers to use on incoming data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const saltRounds = 10;


app.get('/', function(req, res) {
  res.status(200).sendFile(__dirname + "/public_html/index.html");
});

// TODO: THIS HAS TO USE SESSION COOKIES FOR USER TRACKING
// TODO: COOKIES WILL BE ISSUED ON LOG IN AND SIGN UP
app.get('/game', function(req,res){
	res.status(200).sendFile(__dirname + "/public_html/page1.html");
});

// Promise based bug free version
// based on Nick's work
app.post('/signup', function (req, res) {
    let userExists = false;
	let body = req.body;
	if (
		(
		!body.hasOwnProperty("user")  ||
		!body.hasOwnProperty("pass1") ||
		!body.hasOwnProperty("pass2")
		) || ( // The second round only if the properties are defined
		(body.user.length < 4)  ||
		(body.user.length > 15) ||
		(body.pass1.length < 6) ||
		(body.pass1.length > 24)
		) || (
		!(body.pass1===body.pass2)
		)
	)
	{
		return res.sendStatus(400);
	} else {
    let client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect()
    .then(client => {
        let usersC = client.db('spelling_bee').collection('users');
        usersC.findOne({user_name:body.user})
        .then(result => {
            client.close();
            if(result !== null){
                userExists = true;
                return res.status(300).send("User Already Exists.");
            }
            if(!userExists){
                let user;
                bcrypt.hash(req.body.pass1, saltRounds)
                .then(function (hashedPassword){
                    user = {
                        user_name: body.user,
					    password: hashedPassword
                    };
                    let client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
                    client.connect()
                    .then(client => {
                    let usersC = client.db('spelling_bee').collection('users');
                    usersC.insertOne(user)
                        .then(result => {
                            client.close();
                            return res.status(200).redirect(302, '/game');
                        }).catch(error => {
                            console.error(error);
                            return res.status(500).send();
                        });
                    });
                })
                .catch(error => console.error(error));
            }
        }).catch(function (error) {
            return res.status(500).send("The server had an issue, please try again.");
            });
    }).catch(error => {
        console.error(error);
        client.close();
        return status(500).send();
    });
	}
});

// Untested, should spit out all users
app.get('/allUsers', (req, res) => {
	db.collection('users').find().toArray()
	  .then(results => {
      client.close();
		res.status(200).json(results);
	  })
	  .catch(error => {
		  console.error(error);
		  res.status(500).send();
	  });
});

app.get('/get-client', function (req, res) {
    client.connect(err => {
        client.db("spelling_bee").collection("users").findOne(
          {username: req.query.username}, function(err, result) {
            //TODO: fix this? or maybe remove it. Not sure if it's useful as of now. that uncludes the app.gets for /get and /create
          if (err) throw err;

          res.render('update', 
          {
            oldname: result.name, 
            oldusername: result.username, 
            oldpassword: result.password,
            oldpasswordComfirm: result.passwordConfirm, 
            oldscore: result.score, 
            name: result.name,
            username: result.username,
            password: result.password,
            passwordConfirm: result.passwordConfirm,
            score: result.score,
            });
        });
    });
});

// Promise based, cleaned login code
app.post('/login', function(req, res){
	let dbquery;
	if(req.body.hasOwnProperty("username")&&(req.body.username!==""))
		dbquery = {user_name : req.body.username};
	else
		return res.status(401).send("UNAUTHORIZED");

	if(!req.body.hasOwnProperty("password"))
		return res.status(401).send("UNAUTHORIZED");

	//TODO: create 2 master account for quick login if your target testing is not the account database, delete this portion of code after finish
	let masterAcc = ["master1", "master2"];
	if (masterAcc.includes(dbquery.user_name)){
		return res.status(200).redirect(302, '/game');
	}

	let client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	client.connect()
	.then(client => {
		let usersC = client.db('spelling_bee').collection('users');
		usersC.findOne(dbquery)
		.then(result => {
            if(result === null){
                return res.status(401).send("UNAUTHORIZED");
            } else {
                bcrypt
                .compare(req.body.password, result.password)
                .then(function(isSame){
                    if(isSame)
                        return res.status(200).redirect(302, '/game');
                    else
                        return res.status(401).send("Incorrect account info.");
                }) 
                .catch(function (error) {
                    console.log(error);
                    res.status(500).send("The server had an issue, please try again.");
                });
            }
		}).catch(error => {
			console.error(error);
			client.close(); 
			return res.status(500).send();
		});
	});
});


// PUT and DELETE (User update and delete) FUNCTIONS COMING
// WEBSITE: https://zellwk.com/blog/crud-express-mongodb/

//<====================WEBSOCKET======================>

const connectURL = `mongodb+srv://${mongo_username}:${mongo_password}@groupwork.7ykyi.mongodb.net/spelling_bee?retryWrites=true&w=majority`;

let wordPool, word, exampleSentence = "", definition = "";
let difficulty, amount;
let currentPlayers = {};
let userid = 0; //TODO: integrate with user logging feature
let maxPlayers = 1;
let availableDiff = ["easy", "medium", "hard"];
const time = 132000;
let timer;
let userCount = 0;
let isStarting = false;

wordPool = [];

const { createServer } = require('http');
const server = createServer(app);
const wsServer = new websocket.Server({
	server
});

server.listen(8080, function () {
  console.log('Listening on http://localhost:8080/');
});

wsServer.on('connection', async function (ws){
	if (Object.keys(currentPlayers).length > maxPlayers){
		ws.send(JSON.stringify({type: "broadcast", data: `maximum amount of players (${maxPlayers} players) reached, no more connection will be allowed`}));
		ws.terminate();
		return;
	}


	currentPlayers[userCount] = ""; //placeholder
	console.log(Object.keys(currentPlayers).length);
	
	ws.on('message', async function (message){
		let name;
		for (var x in currentPlayers){
			if (currentPlayers[x].connection == ws){
				name = currentPlayers[x].name;
			}
		}
		console.log('received: %s from %s', message, name);
		let command = JSON.parse(message);
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
					if (exampleSentence == ""){
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
			console.log(data);
		}
		
		if (command.type == "answer"){
			data.type = "answerCheck";
			if (command.data == word){
				stopTimer();
				data.data =  true;
				await setNextWord();
				broadcast(word, true, name);
				startTimer();
			}
			else {
				data.data = false;
			}
		}
		
		if (command.type == "gameData"){
			//only called once when the connection is made, so can act as a handler for broadcasting new players
			data.type = "gameData";
			if (maxPlayers == 1) {// starting value, must be played with at least 2
				difficulty = command.level; // then set it
				maxPlayers = parseInt(command.playerCount);
				console.log(maxPlayers);
				console.log(difficulty);
			}
			
			currentPlayers[userCount] = {name: command.playerName, connection: ws, score: 0};
			console.log(currentPlayers[userCount]);
			console.log();
			data.data = {level: difficulty, playerCount: maxPlayers, playerName: currentPlayers[userCount].name}
			name = currentPlayers[userCount].name;
			broadcast(`Player ${name} joined`);
			if (Object.keys(currentPlayers).length == maxPlayers && !isStarting){
				await startGameSession();
			} else {
				console.log("not enough " + Object.keys(currentPlayers).length);
				console.log(currentPlayers + ' of ' + maxPlayers);
				console.log(typeof maxPlayers);
			}
		}
		ws.send(JSON.stringify(data)); 
		userCount++;
	});

	ws.on('close', function () {
		for (var x in currentPlayers){
			if (currentPlayers[x].connection == ws){
				broadcast(`Player ${currentPlayers[x].name} has disconnected.`);
				delete currentPlayers[x];
				break;
			}
		}
	});
});



async function startGameSession(){
	//broadcast for all players to know
	isStarting = true;
	await getWordPool(difficulty);
	console.log(wordPool);
	await setNextWord();
	broadcast(word, true, null);
	startTimer();
	console.log("game start");
	return new Promise (function (resolve){
		resolve("resolved");
	});
}

function startTimer(){
	if (wordPool.length == 0){
		closeGameSession();
		return;
	}
	timer = setTimeout(async function(){
		await setNextWord();
		broadcast(word, true, null);
		startTimer();
	}, time);
}

function stopTimer(){
	clearTimeout(timer);
}

function closeGameSession(){
	isStarting = false;
	wordPool = [];
	maxPlayers = 1;//impossible to play with 1 => best value to reset
	difficulty = "" //mongoDB would return nothing
	wsServer.clients.forEach(function each(client){
		client.terminate();
	});
	clearTimeout(timer);
}

function broadcast(message, isNewWord = false, userid = ""){
	let type = "broadcast";
	if (isNewWord){
		type = "newWord";
	}
	let data = {
		type : type,
		data : message
	};
	if (isNewWord){
		data.userid = userid;
	}
	
	wsServer.clients.forEach(function each(client){
		while (client.readyState !== websocket.OPEN) {
			continue;
		}
		client.send(JSON.stringify(data));
	});
}

function getWordPool(difficulty){
	// query from mongoDB
	// randomize the array also
	
	//Promise-based to deal with async nature of mongodb query
	return new Promise(function(resolve) {
		let client = new MongoClient(connectURL, { useNewUrlParser: true, useUnifiedTopology: true });
		let level = difficulty;
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
							wordPool.push(value.word);
						});
						//console.log(wordPool);
						resolve("resolved");
					})
					.catch(function (error) {
						console.log("error");
					});
		});
	});
}

function setNextWord(){
	return new Promise (function(resolve){
		word = wordPool.shift();
		console.log(word);
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
			
			if (response.data.results[0].definition == null) {
				isError = true;
				error.defintion =  true;
			}
			
			if (response.data.results[0].examples == null){
				isError = true;
				error.example =  true;
			}
			
			if (!error.defintion){
				definition = response.data.results[0].definition;
			} else {
				definition = '';
			}
			
			if (!error.example){
				exampleSentence = response.data.results[0].examples[0];
			} else {
				exampleSentence = '';
			}
			
			if (isError){
				throw error;
			}
			console.log(definition);
			console.log(exampleSentence);
			resolve("resolved");
		}).catch(function (error) {
			console.log(error);
			resolve("resolved");
		});

	});
}
