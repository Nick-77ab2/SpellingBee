(Your code base should contain a readme file that explains all of the steps needed to run a local version of your project.)

- The user need to run the command "nodemon index.js" or "node index.js" to run our App
- Users open the browser, then enter the address to access our app with the URL on the browser: "http://localhost:8080/"
- The login/sign up page will display. If user have already had account, you can simply click on Log In button to login into our system. If not, user click on Sign Up button to resgister the user with 2 information (username, password, password confirm (must be the same with password))
- After login into our system, user will see the page 1 with our project with our group name
- On page 1, user click on how to play the game? User will see a video tutorial. There will be a button on the right side of our video, user click on that button to go to page 2 (Level of the game).
- On page 2, user will see 3 level. 
  + Level 1 corresponds with the EASY level.
  + Level 2 corresponds with the MEDIUM level.
  + Level 3 corresponds with the HARD level.
- When user clicks one of the 3 level, user will go to the page 3. Page 3 is the main page of our game.
- There are a lot of buttons on page 3, we will talk about 5 sections on the top first, from left to right
  + First button is Hint. When user clicks on Hint button, there is a voice will read the example sentence of the word
  + Second button is Meaning. When user clicks on Meaning button, there is a meaning popup will display the definition of the word,
  + Third on the NOT the Button, they just simply a roll paper will display the level you are currently playing
  + Fouth button is the timer of. You will have a specific time to answer your question. Normally is 5:00 (5 minutes) for one level
  + Fifth button is the Score button. For each question that you answered correct, you will get 10 points. The levels are separated by difficult of words.
- In the middle, from left to right, there are 3 columns
  + First column will display the popup section when user clicks on mearning button (second button)
  + Second column is the game content
    * First row, user click on play button to listen the pronunciation of the word.
    * Second row, use enters the world that he/she listen before
    * Third row, after user enter his/her answer, user click on ENTER button. If user's answer is correct, he/she will get the score; otherwise, user should answer again. You can use the HINT and MEANING button to hear the example sentence or see the definition of that word, respectively.
  + Third column, on the right side will content 4 button. We will talk from top to bottom
    * First column, the PLAY button, when user clicks on that button, user will hear the pronunciation of that word.
    * Second column, the CANCEL button, when user clicks on that button, user will exit the session (therefore ending the multiplayer)
    * Third column, the REPLAY button, the replay button will work at the end of the session to replay the level.
    * Fourth column, the NEXT LEVEL button, the next button will move you back to page 2, the Level map. (at end of game session)