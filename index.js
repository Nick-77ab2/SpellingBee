let express = require('express');
let bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const env = require('./env.json');
const gamefile= require('./gamefile.js');
let app = express();

const MongoClient = require('mongodb').MongoClient;
const mongo_username = env.MONGO_USERNAME
const mongo_password = env.MONGO_PASSWORD
const uri = `mongodb+srv://${mongo_username}:${mongo_password}@groupwork.7ykyi.mongodb.net/spelling_bee?retryWrites=true&w=majority`;

let port = 5000;
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
	res.status(200).sendFile(__dirname + "/public_html/game.html");
});

// Promise based bug free version
// based on Nick's work
app.post('/signup', function (req, res) {
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
			let user;
			bcrypt.hash(req.body.pass1, saltRounds)
			.then(function (hashedPassword){
				user = {
					user_name: body.user,
					password: hashedPassword,
				};
				let client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
				client.connect()
				.then(client => {
				let usersC = client.db('spelling_bee').collection('users');
				usersC.insertOne(user)
				.then(result => {
					client.close();
          // Return ok status and redirect to the game
					return res.status(200).redirect(302, '/game');
				}).catch(error => {
					console.error(error);
					return status(500).send();
				});
			});
		})
		.catch(error => console.error(error));
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
		return status(401).send("UNAUTHORIZED");

	if(!req.body.hasOwnProperty("password"))
		return status(401).send("UNAUTHORIZED");

	let client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	client.connect()
	.then(client => {
		let usersC = client.db('spelling_bee').collection('users');
		usersC.findOne(dbquery)
		.then(result => {
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
		}).catch(error => {
			console.error(error);
			client.close();
			return status(500).send();
		});
	});
});

// PUT and DELETE (User update and delete) FUNCTIONS COMING
// WEBSITE: https://zellwk.com/blog/crud-express-mongodb/

app.listen(port,() => {
	console.log(`Listening at: http://${hostname}:${port}`);
});