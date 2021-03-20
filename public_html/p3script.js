
//Page 3 will connect to the Websocket server and most of the action will go on in there.
//var alreadyCorrect;
var word;
var isCorrect;
var previousCorrect = true;
var wordDefinition;
var previousWord;
var wordSentence;
let currentLevel = document.getElementById("currentLevel");
var level;
var name;
var theTimer;
var currentlyReceiving;
var playerCount;
var utterWord;
var userid;
var broadcastValue;
var utterSentence;
var wordsFinished=-1;
let theScore = document.getElementById("score");
let gainedPoints = document.getElementById("gainedPoints");
let playerJoinText = document.getElementById("playerJoin");
let playerJoin = document.getElementById("text_popup");
document.getElementById('timer').innerHTML = 002 + ":" + 12;
level = localStorage.getItem("levelNumber");

url = `wss://${location.host}`;
var connection = new WebSocket(url);

//<=========LOG CONNECTION, GRAB DATA FROM LOCALSTORAGE AND SEND IT IMMEDIATELY=============>
connection.onopen = function() {
  console.log('successfully connected to ' + url);
  playerCount = localStorage.getItem("playerCount");
  console.log("THE USERNAMES ARE: " + localStorage.getItem("username"));
  name = localStorage.getItem("username");
  currentLevel.textContent = level;
  currentlyReceiving=true;
  sendGameData(name,level,playerCount);
};
connection.onclose = function() {
  console.log(`Closing the web socket`);
  window.location.href = "./page2.html";

};
//${userid} has joined the game.
//<===========RECIEVE DATA FROM WEBSOCKET============>
connection.onmessage = function(message) {
  data = JSON.parse(message.data);
 // console.log(message);
  //console.log(data.data)
  switch (data.type) {
    case "newWord":
      wordsFinished+=1;
      currentlyReceiving=true;
      if(data.userid!=null){
        clearTimeout(startTimer);
        userid=data.userid;
        console.log("The userid: %s", userid);
        gainedPoints.style.visibility = "visible";
        setTimeout(() => { gainedPoints.style.visibility = "hidden" }, 2000);
        gainedPoints.textContent = `A player has correctly spelled the word.`;
      }
      if(wordsFinished!=10){
        word = data.data;
        console.log("Recieved next word");
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
      //console.log(wordSentence);
      utterSentence = new SpeechSynthesisUtterance(wordSentence);
      utterWord = new SpeechSynthesisUtterance(word);
      document.getElementById('timer').innerHTML = 002 + ":" + 12;
      currentlyReceiving=false;
      if(wordsFinished==0){
      startTimer();
      previousWord=word;
      }
      break;
    case "answerCheck":
      isCorrect = data.data;
      console.log("isCorrect: " + isCorrect + "previous Correct: " + previousCorrect + " current word: " + word + " previous word: " + previousWord);
      gainedPoints.textContent = `A player has correctly spelled the word.`;
      if(isCorrect && previousCorrect!=isCorrect && wordsFinished==0){
          console.log("do nothing");
      }
      else if(!isCorrect && previousCorrect!=isCorrect)
        previousCorrect=isCorrect;
      else if (isCorrect && ((previousCorrect!=isCorrect) || (previousCorrect==isCorrect))) {
        previousCorrect=isCorrect;
        previousWord=word;
        console.log("User got A word Correct")
        gainedPoints.textContent = `You have correctly spelled the word!`;
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
      playerJoinText.textContent = broadcastValue;
      playerJoin.style.visibility = "visible";
      setTimeout(() => { playerJoin.style.visibility = "hidden" }, 2000);
      break;
    case "gameData":
      //console.log(data);
      //console.log(data.data.playerCount);
      //console.log(data.data.playerName);
      //console.log(data.data.level);
      
    default:
      console.log("something went wrong");
      break;
  }
};
//<================USER ANSWER BUTTON=======================>
let enterButton = document.getElementById("userEnter");
enterButton.addEventListener("click", function() {
  //if true when not correct, doesn't run once it's correct once.
  console.log(" CurrentlyRecieving: " + currentlyReceiving);
  if (currentlyReceiving==false) {
    let userAnswer = document.getElementById("userAnswer").value;
    console.log("userAnswer: " + userAnswer);
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
    clearTimeout(startTimer);
    return null;
  }
  else{
  document.getElementById('timer').innerHTML = m + ":" + s;
  setTimeout(startTimer, 1000);
  }
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

let cancelButton = document.getElementById("cancel");

cancelButton.addEventListener("click", function() {
  console.log("Button close session");
  connection.close();
});
