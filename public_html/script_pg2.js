//Yes
/*word="testing";
wordDefinition="To do something in a way that may break it";
wordSentence="I was testing the lawnmower yesterday";
var synth=window.speechSynthesis;
var utterWord= new SpeechSynthesisUtterance(word);
var utterDefinition= new SpeechSynthesisUtterance(wordDefinition);
var utterSentence= new SpeechSynthesisUtterance(wordSentence);
let speechTesting=document.querySelector("button");
speechTesting.addEventListener("click", function(){
  synth.speak(utterWord);
  synth.speak(utterDefinition);
  synth.speak(utterSentence);
});
*/
var level;
let levelOneListener = document.getElementById("level1");
let levelTwoListener = document.getElementById("level2");
let levelThreeListener = document.getElementById("level3");

//send the selected level to local storage and load page 3

levelOneListener.addEventListener("click", function () {
  level = "easy";
  localStorage.setItem("levelNumber", level);
  //window.location.href ="./page3.html";
});

levelTwoListener.addEventListener("click", function () {
  level = "medium";
  localStorage.setItem("levelNumber", level);
  //window.location.href ="./page3.html";
});

levelThreeListener.addEventListener("click", function () {
  level = "hard";
  localStorage.setItem("levelNumber", level);
  //window.location.href ="./page3.html";
});

let showPopup1 = document.querySelector(".showPopup1");
let showPopup2 = document.querySelector(".showPopup2");
let showPopup3 = document.querySelector(".showPopup3");
let popUp = document.getElementById("the_popup");
let hidePopup = document.getElementById("hidePopup");

showPopup1.addEventListener("click", function () {
  popUp.style.visibility = "visible";
});

showPopup2.addEventListener("click", function () {
  popUp.style.visibility = "visible";
});

showPopup3.addEventListener("click", function () {
  popUp.style.visibility = "visible";
});

hidePopup.addEventListener("click", function () {
  popUp.style.visibility = "collapse";
});

let btnLevel = document.getElementById("btn_level");
let textInput = document.getElementById("input_number");

btnLevel.addEventListener("click", function () {
  if (textInput.value !== "" && Number(textInput.value) >1) {
    localStorage.setItem("playerCount", textInput.value);
    window.location.href = "./page3.html";
  } else {
    alert("Please enter the number of players");
  }
  textInput.value = ""; // clear the input text
});