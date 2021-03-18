
//Page 3 will connect to the Websocket server and most of the action will go on in there.
var alreadyCorrect = false;
var wordTest = "testing";
var word;
var wordDefinitionTest = "To do something in a way that may break it";
var wordDefinition;
var wordSentenceTest = "I was testing the lawnmower yesterday";
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

//<==========GRAB LEVEL FROM LOCALSTORAGE==============>
window.onload = function() {
  level = localStorage.getItem("levelNumber");
  playerCount = localStorage.getItem("playerCount");
  console.log(playerCount);
  name = localStorage.getItem("username");
  currentLevel.textContent = level;
};

url = `wss://${location.host}` //url of server here
console.log(url);
var connection = new WebSocket(url);

//<=========LOG CONNECTION AND SEND THE LEVEL IMMEDIATELY=============>
function convertLevel(level){
  if(level==="1"){
    return "easy";
  }
  else if (level==="2"){
    return "medium";
  }
  else{
    return "hard";
  }
}
function convertplayerCount(playerCount){
  return parseInt(playerCount);
}
connection.onopen = function() {
  console.log('successfully connected to ' + url);
  let theLevel=convertLevel(level);
  let theCount=convertplayerCount(playerCount);
  sendGameData(name,theLevel,theCount);
};


//<===========RECIEVE DATA FROM WEBSOCKET============>
connection.onmessage = function(message) {
  data = JSON.parse(message.data);
  console.log(message);
  switch (data.type) {
    case "newWord":
      wordsFinished+=1;
      if(data.userid!=null){
          userid=data.userid;
          //insert thing to push this out, yea
      }
      if(wordsFinished!=10){
        word = data.data;
        utterWord = new SpeechSynthesisUtterance(word);
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
      wordSentence = data.data;
      utterSentence = new SpeechSynthesisUtterance(wordSentence);
      console.log(data.data);
      document.getElementById('timer').innerHTML = 00 + ":" + 31;
      startTimer();
      break;
    case "answerCheck":
      let isCorrect = data.data;
      alreadyCorrect = isCorrect; //set alreadyCorrect so user can't constantly send data.
      if (isCorrect) {
        let test = theScore.textContent;
        gainedPoints.style.visibility = "visible";
        setTimeout(() => { gainedPoints.style.visibility = "hidden" }, 2000);
        test = parseInt(test);
        test += 10;
        theScore.textContent = test;
        console.log(data.data);
      }
      break;
    case "broadcast":
      console.log(data.data);
      broadcastValue=data.data;
      break;
    case "gameData":
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