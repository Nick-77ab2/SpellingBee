//get to server for word data during onLoad?
//take data to variables. use variables for TTS
//Testing TTS -Nick
var alreadyCorrect=false;
var wordTest="testing";
var word;
var wordDefinitionTest="To do something in a way that may break it";
var wordDefinition;
var wordSentenceTest="I was testing the lawnmower yesterday";
var wordSentence;
let currentLevel=document.getElementById("currentLevel");
//grab the level selected in page 2 from local storage and grab the words and their data from the server.
var wordpool=[];
var definitionPool=[];
var sentencePool=[];
var level;

//<==========GRAB LEVEL FROM LOCALSTORAGE==============>
window.onload=function(){
  level=localStorage.getItem("levelNumber");
  currentLevel.textContent=level;
};

url = 'ws://localhost:8080' //url of server here
var connection = new WebSocket(url);

connection.onopen = function(){
	console.log('successfully connected to ' + url);
};

//<==========RECIEVE DATA FROM WEBSOCKET============>
connection.onmessage = function (message) { 
	data = JSON.parse(message.data);
	console.log(message);
	switch (data.type) {
    case "newWord":
      word=data.data;
      getDefinition();
      break;
		case "definition":
			let theDefinition=document.getElementById("definition");
      wordDefinition=data.data;
      theDefinition.textContent=wordDefinition;
      getExampleSentence();
			break;
		case "exampleSen":
			wordSentence=data.data;
			console.log(data.data);
      document.getElementById('timer').innerHTML = 005 + ":" + 01;
      startTimer();
			break;
		case "answerCheck":
      let isCorrect=data.data;
      if(isCorrect){
			  let test=theScore.textContent;
        gainedPoints.style.visibility="visible";
        setTimeout(() => { gainedPoints.style.visibility="hidden" }, 2000);
        test=parseInt(test);
        test+=10;
        theScore.textContent=test;
			  console.log(data.data);
      }
			break;
		case "broadcast":
			console.log(data.data);
			break;
		default:
			console.log("something went wrong");
			break;
	}
};

//testing changing the score Should be a function to reset timer.
let theScore=document.getElementById("score");
let gainedPoints=document.getElementById("gainedPoints");
if(theScore.textContent=="10"){
  let test=theScore.textContent;
  gainedPoints.style.visibility="visible";
  setTimeout(() => { gainedPoints.style.visibility="hidden" }, 2000);
  test=parseInt(test);
  test+=10;
  theScore.textContent=test;
  //document.getElementById('timer').innerHTML = 00 + ":" + 10;
  //startTimer();
}
let enterButton=document.getElementById("userEnter");
enterButton.addEventListener("click", function(e){
  if(!alreadyCorrect){
    let userAnswer=document.getElementById("userAnswer").value;

  }
}
});
//starting the timer on its own
document.getElementById('timer').innerHTML = 005 + ":" + 01;
startTimer()

//setting up text to speech and definition
var synth=window.speechSynthesis;
var utterWord= new SpeechSynthesisUtterance(word);
var utterSentence= new SpeechSynthesisUtterance(wordSentence);

let wordTesting=document.getElementById("playWordTTS");
wordTesting.addEventListener("click", function(){
  synth.speak(utterWord);
});

let sentenceTesting=document.getElementById("playSentenceTTS");
sentenceTesting.addEventListener("click", function(){
  synth.speak(utterSentence);
});

let showMeaning=document.getElementById("showMeaning");
let popUp=document.getElementById("meaning_popup");
showMeaning.addEventListener("click", function(){
  popUp.style.visibility="visible";
});
let hideMeaning=document.getElementById("hideMeaning");
hideMeaning.addEventListener("click", function(){
  popUp.style.visibility="hidden";
});


//<=============found on codepen and re-written to work to our needs================>

function startTimer(){
  var presentTime = document.getElementById('timer').innerHTML;
  var timeArray = presentTime.split(/[:]+/);
  var m = timeArray[0];
  var s = checkSecond((timeArray[1] - 1));
  if(s==59){
    m=m-1;
  }
  if(m==0 && s=="00"){
    timerComplete=true; //used to end word with noone getting it right.
    document.getElementById('timer').innerHTML= m + ":" + s;
    return null;
  }
  document.getElementById('timer').innerHTML= m + ":" + s;
  setTimeout(startTimer, 1000);
}

function checkSecond(sec){
  if (sec <10 && sec >=0){
    sec = "0" + sec;
  }
  if(sec <0){
    sec = "59";
  }
  return sec;
}

/* <============EXAMPLE JQUERY CODE========================>

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
/* <========================FUNCTIONS FOR GETTING INFORMATION FROM THE WEBSOCKET SERVER ================>*/
function getDefinition(){
	var command = {
		type: "help",
		data: "definition"
	};
	
	connection.send(JSON.stringify(command));
}

function getExampleSentence(){
	var command = {
		type: "help",
		data: "exampleSen"
	};
	
	connection.send(JSON.stringify(command));
}

function sendAnswer(answer){
	var command = {
		type: "answer",
		data: answer
	}
	
	connection.send(JSON.stringify(command));
}