//Yes
var level;
let levelOneListener=document.getElementById("level1");
let levelTwoListener=document.getElementById("level2");
let levelThreeListener=document.getElementById("level3");

//send the selected level to local storage and load page 3

levelOneListener.addEventListener("click", function(){
  level=1;
  localStorage.setItem("levelNumber", level);
  window.location.href ="./page3.html";
});

levelTwoListener.addEventListener("click", function(){
  level=2;
  localStorage.setItem("levelNumber", level);
  window.location.href ="./page3.html";
});

levelThreeListener.addEventListener("click", function(){
  level=3;
  localStorage.setItem("levelNumber", level);
  window.location.href ="./page3.html";
});
