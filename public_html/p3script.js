
//Page 3 will connect to the Websocket server and most of the action will go on in there.
var alreadyCorrect = false;
var word;
var wordDefinition;
var wordSentence;
let currentLevel = document.getElementById("currentLevel");
var level;
var name;
var playerCount;
var utterWord;
var userid;
var broadcastValue;
var utterSentence;
var wordsFinished=-1;
let theScore = document.getElementById("score");
let gainedPoints = document.getElementById("gainedPoints");
let playerJoinText = document.getElementById("playerJoin");
let playerJoin = document.getElementById("text_popup")
document.getElementById('timer').innerHTML = 00 + ":" + 31;
level = localStorage.getItem("levelNumber");
var wordPool=[];
fetch(`/getwords?level=${level}`).then(function(response){
  return response.json();
}).then(function(data){
  wordPool=data.slice(0);
  console.log(wordPool);
  url = `wss://${location.host}` //url of server here
  console.log(url);
  var connection;
  connection = new WebSocket(url);
}).catch(function(error){
  console.log("error:", error);
});


//<=========LOG CONNECTION, GRAB DATA FROM LOCALSTORAGE AND SEND IT IMMEDIATELY=============>
connection.onopen = function() {
  console.log('successfully connected to ' + url);
  level = localStorage.getItem("levelNumber");
  playerCount = localStorage.getItem("playerCount");
  console.log(playerCount);
  name = localStorage.getItem("username");
  currentLevel.textContent = level;
  sendGameData(name,level,playerCount);
};

//${userid} has joined the game.
//<===========RECIEVE DATA FROM WEBSOCKET============>
connection.onmessage = function(message) {
  data = JSON.parse(message.data);
  console.log(message);
  console.log(data.data)
  switch (data.type) {
    case "newWord":
      wordsFinished+=1;
      if(data.userid!=null){
          userid=data.userid;
          gainedPoints.textContent = '${userid} has correctly spelled the word.';
        gainedPoints.style.visibility = "visible";
        setTimeout(() => { gainedPoints.style.visibility = "hidden" }, 2000);
      }
      if(wordsFinished!=10){
        word = data.data;
        utterWord = new SpeechSynthesisUtterance(word);
        document.getElementById('timer').innerHTML = 00 + ":" + 31;
        getDefinition();
      }
      break;
    case "definition":
      let theDefinition = document.getElementById("definition");
      wordDefinition = data.data;
      theDefinition.textContent = wordDefinition;
      getExampleSentence();
      break;
    case "exampleSen":
      startTimer();
      wordSentence = data.data;
      utterSentence = new SpeechSynthesisUtterance(wordSentence);
      break;
    case "answerCheck":
      let isCorrect = data.data;
      alreadyCorrect = isCorrect; //set alreadyCorrect so user can't constantly send data.
      if (isCorrect) {
        let userPoints = theScore.textContent;
        gainedPoints.style.visibility = "visible";
        setTimeout(() => { gainedPoints.style.visibility = "hidden" }, 2000);
        userPoints = parseInt(userPoints);
        userPoints += 10;
        theScore.textContent = userPoints;
      }
      break;
    case "broadcast":
      broadcastValue=data.data;
      userid=data.userid;
      playerJoinText.textContent = '${userid} has joined the game.';
      playerJoin.style.visibility = "visible";
      setTimeout(() => { playerJoin.style.visibility = "hidden" }, 2000);
      break;
    case "gameData":
      console.log(data);
      console.log(data.playerCount);
      console.log(data.playerName);
      console.log(data.level);
      
    default:
      console.log("something went wrong");
      break;
  }
};
//<================USER ANSWER BUTTON=======================>
let enterButton = document.getElementById("userEnter");
enterButton.addEventListener("click", function() {
  //if true when not correct, doesn't run once it's correct once.
  if (!alreadyCorrect) {
    let userAnswer = document.getElementById("userAnswer").value;
    sendAnswer(userAnswer);
  }
});

//<==================SETTING UP TEXT TO SPEECH AND DEFINITION================>
var synth = window.speechSynthesis;

let wordTesting = document.getElementById("playWordTTS");
wordTesting.addEventListener("click", function() {
  synth.speak(utterWord);
});

let sentenceTesting = document.getElementById("playSentenceTTS");
sentenceTesting.addEventListener("click", function() {
  synth.speak(utterSentence);
});

let showMeaning = document.getElementById("showMeaning");
let popUp = document.getElementById("meaning_popup");
showMeaning.addEventListener("click", function() {
  popUp.style.visibility = "visible";
});
let hideMeaning = document.getElementById("hideMeaning");
hideMeaning.addEventListener("click", function() {
  popUp.style.visibility = "hidden";
});


//<=============found on codepen and re-written to work to our needs================>

function startTimer() {
  var presentTime = document.getElementById('timer').innerHTML;
  var timeArray = presentTime.split(/[:]+/);
  var m = timeArray[0];
  var s = checkSecond((timeArray[1] - 1));
  if (s == 59) {
    m = m - 1;
  }
  if (m == 0 && s == "00") {
    document.getElementById('timer').innerHTML = m + ":" + s;
    return null;
  }
  document.getElementById('timer').innerHTML = m + ":" + s;
  setTimeout(startTimer(), 1000);
}

function checkSecond(sec) {
  if (sec < 10 && sec >= 0) {
    sec = "0" + sec;
  }
  if (sec < 0) {
    sec = "59";
  }
  return sec;
}

/* <====================EXAMPLE JQUERY CODE========================>

$(document).ready(function() {
    $( ".items pop_up, .items pop_up *" ).dialog( "close" );
    $("#showMeaning").click((e)=>{
        $( ".items pop_up, .items pop_up *" ).dialog( "open" );
    });
});
*/
//currently just testing
/*
jQuery 101:

if running on server: <script src="jquery.mobile-1.4.5/jquery-1.11.1.min.js"></script>
if running away from server: 
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>

$("#playSentenceTTS").click((e)=>{
    synth.speak(utterSentence);
});
*/


//possible use of play on side if we need to repurpose it for ability to start play if less than max players.
//only use will be before start.
let play = document.getElementById("play");
play.addEventListener("click", function() {
  if (document.getElementById('timer').textContent == "")
    playMain();
});

let replayButton = document.getElementById("replay");
replayButton.addEventListener("click", function() {
  if(wordsFinished==10)
    sendReplayRequest();
});

let nextButton = document.getElementById("next");
nextButton.addEventListener("click", function() {
  if(wordsFinished==10){
    sendNextConfirm();
    window.location.href = "./page2.html";
  }
});

/* <========================FUNCTIONS FOR GETTING INFORMATION FROM THE WEBSOCKET SERVER ================>*/

function getDefinition() {
  var command = {
    type: "help",
    data: "definition"
  };

  connection.send(JSON.stringify(command));
}

function getExampleSentence() {
  var command = {
    type: "help",
    data: "exampleSen"
  };

  connection.send(JSON.stringify(command));
}

function sendAnswer(answer) {
  var command = {
    type: "answer",
    data: answer
  }

  connection.send(JSON.stringify(command));
}

function sendReplayRequest() {
  var command = {
    type: "replay",
    data: true
  }
  connection.send(JSON.stringify(command));
}

function sendGameData(name, level, count){
  var command = {
    type: "gameData",
    playerName: name,
    level: level,
    playerCount: count
  }
  connection.send(JSON.stringify(command));
}
//might not need, due to the internal use. possibly similar to the cancel function
function sendNextConfirm() {
  var command = {
    type: "nextPage",
    data: true
  }
  connection.send(JSON.stringify(command));
}

//possible use of play on side if we need to repurpose it for ability to start play if less than max players.
function playMain() {
  var command = {
    type: "startRequest",
    data: "start"
  }
  connection.send(JSON.stringify(command));
}

let cancelButton = document.getElementById("cancel");

//Currently the websocket doesn't work, this is code based on a model
//if this is what is to be expected, then i will keep it.
// this code does not work
cancelButton.addEventListener("click", function(e) {
  e.preventDefault();
  //possible addition of a connection.send for notification to websocket of a closed client (if websocket doesn't already get notified)
  console.log("Button close session");
  connection.close();
  connection.onclose = function(event) {
    if (event.wasClean) {
      console.log(`Closing the web socket`);
      setTimeout(window.location.href = "./page2.html", 2000); //do we need this?
    } else {
      console.log('Connection failed, so cannot close the web socket');
    }
  };
});