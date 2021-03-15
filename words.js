const express = require('express');
const env = require('./env.json');
const bodyParser = require('body-parser');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const { exit } = require('process');
const axios = require("axios").default;

const mongo_username = env.MONGO_USERNAME;
const mongo_password = env.MONGO_PASSWORD;
const api_key = env.API_KEY;
const connectURL = `mongodb+srv://${mongo_username}:${mongo_password}@groupwork.7ykyi.mongodb.net/spelling_bee?retryWrites=true&w=majority`;
const client = new MongoClient(connectURL, { useUnifiedTopology: true });

const arrayLevel = ["easy", "medium", "hard"];
const GET_NUMBER_WORDS = 10;

const fileData = 'data.json';

let port = 5000;
let hostname = "localhost";
let app = express();

app.use(express.static('public_html'));
app.use(express.json());


client.connect(function (error) {
    console.log('Connected to Database');
    const db = client.db('spelling_bee');
    const wordsCollection = db.collection('words');

    /*
    One call:
    - call to database->filter is difficulty var itself -> grab 10 words out of the list of received words.
    - the rest of the data get's taken from the api, put together in a nice format with that, and sent in a res.json.
     */
    app.get("/getWordPool", function (req, res) {
        let level = "easy"; // replace by place req.query.level from client side
        let dataStorage = []
        if (arrayLevel.includes(level)) {
            // randomly grab from database
            wordsCollection.aggregate([
                { $match: { "difficulty": level } },
                { $sample: { size: 10 } },
                { $project: { "word": 1, "_id": 0 } },
            ]).toArray()
                .then(function (data) {
                    data.forEach(function (value, index) {
                        var options = {
                            method: 'GET',
                            url: `https://wordsapiv1.p.rapidapi.com/words/${value.word}`,
                            headers: {
                                'x-rapidapi-key': `${api_key}`,
                                'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com'
                            }
                        };

                        axios.request(options).then(function (response) {
                            let data = response.data;
                            let definition = data.results[0].definition;
                            let example = data.results[0].examples[0]; // there some words have no examples Nick->changed to grab first example.

                            dataStorage.push({ word: value.word, definition: definition, example: example });
                            fs.writeFile(fileData, JSON.stringify(dataStorage), err => {
                                if (error) {
                                    console.error(error);
                                    return
                                }
                            });

                            //res.status(200).json({ word: value.word, definition: definition });
                            //res.status(200).json({ dataStorage: dataStorage });
                        }).catch(function (error) {
                            res.json({ definition: "not available" });
                        });
                    });
                    const dataSend = JSON.parse(fs.readFileSync(fileData));
                    res.status(200).json({ words: dataSend });
                })
                .catch(function (error) {
                    res.status(500).send({ status: "ERROR", message: "Error getting word from database" })
                });
            //res.send({ status: "OK", message: `You got ${GET_NUMBER_WORDS} from database` });
        } else {
            res.status(500).send({ status: "ERROR", message: "Error getting word from database" });
        }
    });

    function createWord(whatWord, whatDifficulty) {
        const wordObject = {
            word: whatWord,
            difficulty: whatDifficulty,
        };
        wordsCollection.insertOne(wordObject);
    }

    function writeToFile() {
        getWordsCollectionFromDB(db, function (docs) {
            // Writing the words collection from MongoDB to data.json file
            try {
                fs.writeFileSync(fileData, JSON.stringify(docs));
                console.log("Done exporting to file");
                exit(0);
            } catch (error) {
                console.log("Error happen when writing to file", error);
            }
            fs.close(fd, function () {
                console.log('wrote the file successfully');
            });
        });
    };

    //writeToFile();


    function getWordsPool() {
        const data = JSON.parse(fs.readFileSync(fileData));
        return data;
    }

    function getData(whatWord) {
        let dataWordsCollection = getWordsPool();
        for (let i = 0; i < dataWordsCollection.length; i++) {
            if (dataWordsCollection[i].word === whatWord) {
                return dataWordsCollection[i];
            }
        }
    }

    function getNextWord() {
        let dataWordsCollection = getWordsPool();
        const index = randomIndex(0, dataWordsCollection.length - 1);
        return dataWordsCollection[index];
    }

    //console.log(getNextWord());

});

function randomIndex(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getWordsCollectionFromDB = function (db, callbackFucntion) {
    db.collection('words').find().toArray(function (error, result) {
        if (error) {
            console.log("Error getting the collections", error.message);
            throw error;
        }
        callbackFucntion(result);
    });
};

app.get('/', (req, res) => {
    res.send("Hello");
})

app.listen(port, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});

// words: word, exampleSentence, difficulty

// createWord("age", "easy");
// createWord("jam", "easy");
// createWord("not", "easy");
// createWord("circle", "easy");
// createWord("father", "easy");
// createWord("donate", "easy");
// createWord("people", "easy");
// createWord("sugar", "easy");
// createWord("water", "easy");
// createWord("pizza", "easy");
// createWord("heart", "easy");
// createWord("book", "easy");
// createWord("ball", "easy");
// createWord("baby", "easy");
// createWord("army", "easy");

// createWord("anxiety", "medium");
// createWord("account", "medium");
// createWord("develop", "medium");
// createWord("foreign", "medium");
// createWord("history", "medium");
// createWord("highway", "medium");
// createWord("manager", "medium");
// createWord("chipotle", "medium");
// createWord("business", "medium");
// createWord("elephant", "medium");
// createWord("football", "medium");
// createWord("kindness", "medium");
// createWord("treasure", "medium");
// createWord("sandwich", "medium");
// createWord("november", "medium");

// createWord("basketball", "hard");
// createWord("characters", "hard");
// createWord("watermelon", "hard");
// createWord("appreciate", "hard");
// createWord("government", "hard");
// createWord("university", "hard");
// createWord("restautant", "hard");
// createWord("lightboard", "hard");
// createWord("identical", "hard");
// createWord("christmas", "hard");
// createWord("happiness", "hard");
// createWord("adventure", "hard");
// createWord("dabgerous", "hard");
// createWord("knowledge", "hard");
// createWord("halloween", "hard");