/***************************** GAME FLOW *****************************/

// call this update once every tick
function updateTick() {
  

  if(difficulty < 4) {
    /******* levels 1-4 *******/
    levelsOnetoFour();

    /******* level 4-7 *******/
    levelsFourToSeven();

    /******* levels 8-10 *******/
    levelsEightToTen();

    /******* levels 10-14 *******/
    levelsTenToFourteen();

    /******* level 14+ loop infinitely *******/
    levelsFourteenPlus();
  } else {
    maxDifficulty();
  }



  /******* speed handler *******/
  speedHandler();

  /******* random items *******/
  itemHandler();

  /******* score and level labels *******/
  labelHandler();
}


// random events for max difficulty

function randomOne() {
  randomBlock(randomSpeed, randomDirections[0]);
}

function randomTwo() {
  randomBlock(randomSpeed, randomDirections[0]);
  randomBlock(randomSpeed, randomDirections[1]);
}

function randomThree() {
  randomBlock(randomSpeed, randomDirections[0]);
  randomBlock(randomSpeed, randomDirections[1]);
  randomBlock(randomSpeed, randomDirections[2]);
}


// for a special difficulty
function maxDifficulty() {
  if(score >= levels[0]) {
    dark(levels[0] + 1);
  }

  if(score > levels[1] && score < levels[4]) {
    if(score == levels[1] + 1) {
      randomDirections = pickRandom(directions, 3);
      randomSpeed++;
    }
    
    reversal(levels[2]);
    randomThree();
  }

  if(score > levels[4] && score < levels[8]) {
    if(score == levels[4] + 1) {
      randomDirections = pickRandom(directions, 3);
      randomSpeed++;
    }
    
    reversal(levels[5]);
    randomThree();
  }

  if(score == levels[8]) {
    referencePoint = score;
  }

  if(score > levels[8]) {
    // continuously update the reference point so the same actions
    // repeat every 4 ticks
    if(score == referencePoint + tick * 4) {
      referencePoint = score;
      gap--;
      randomSpeed++;
    }

    infinite(referencePoint);
  }
}

// regular progression

function levelsOnetoFour() {
  // up then down then left then right
  if(score > levels[0] && score < levels[1]) {
    randomBlock(randomSpeed, direction.DOWN);
  }
  if(score > levels[1] && score < levels[2]) {
    randomBlock(randomSpeed, direction.UP);
  }
  if(score > levels[2] && score < levels[3]) {
    randomBlock(randomSpeed, direction.LEFT);
  }
  if(score > levels[3] && score < levels[4]) {
    randomBlock(randomSpeed, direction.RIGHT);
  }
}

function levelsFourToSeven() {
    // pick two different random directions for each level
  if(score >= levels[4] && score % tick == 0) {
    console.log("Random directions @ " + score);
    randomDirections = pickRandom(directions, 2);
  }

  // generate the random blocks with the randomly directions
  if(score > levels[4] && score < levels[8]) {
    randomBlock(randomSpeed, randomDirections[0]);
    randomBlock(randomSpeed, randomDirections[1]);
  }
}

function levelsEightToTen() {
  // levels 8-10, blocks from all four directions
  if(score > levels[8] && score < levels[9]) {
    clutter()
  }

  // slow down all the blocks since it will be coming from all foru directions
  if(score == levels[8]) {
    gap = 32;
    randomSpeed--;
  }

  /******* use level 9 to transition to dark mode *******/
  // this control continues until level 14
  if(score >= levels[9]) {
    dark(levels[9]);
  }
}

function levelsTenToFourteen() {
  // wait a little bit before going into the next phase
  var blockThreshold = levels[10] - halftick;

  if(score == blockThreshold) {
    var textBlock = new Block(canvas.width, canvas.height/2, 800, 80, WHITE);
    textBlock.state = direction.LEFT;
    textBlock.text = 'hey. thanks for playing, good luck. -marcus';
    textBlock.speed = 5;
    textBlock.collide = false;
    blocks.push(textBlock);
  }

  // lower number of pieces but faster speed
  if(score == levels[10]) {
    gap = 44;
    randomSpeed += 10;
  }
 
  // programmed levels after 10
  if(score > blockThreshold) {
    infinite(levels[10]);
  }
}

function levelsFourteenPlus() {
  if(score == levels[14]) {
    referencePoint = score;
  }

  if(score > levels[14]) {
    // continuously update the reference point so the same actions
    // repeat every 4 ticks
    if(score == referencePoint + tick * 4) {
      referencePoint = score;
      gap--;
      randomSpeed++;
    }

    infinite(referencePoint);
  }
}

// increase the speed every 4 levels
function speedHandler() {
  // !!! increment the speed every 4 levels until 
  if(score < levels[16] && score % (tick * 4) == 0) {
    console.log("Speed increase");
    randomSpeed++;
  }
}


// put on an item on the board every half tick
function itemHandler() {
  // disable random items for a half tick after activation
  //  disable effects of previous item after a half tick

  if((bonus % 4 == 0 ||  bonus % 7 == 0) && bonus > 0) {
    bonus++;
    player.state = "life";
    labelBonus.classList.add("label-bonus");
    useItem(player, true);
  }
  
  if(lastUsed == "reverse") {
    reversal(originalScore + halftick);
  }

  if(originalScore + halftick == score) {
    if(lastUsed == "slow")
      randomSpeed = originalSpeed;

    if(lastUsed != "reverse")
      lastUsed = "";

    activeItem = false;
  }

  // every half tick after level 4, place a random item on the screen
  if((score > levels[4] || difficulty >= 2) && items.length < 1) {
    if(score % halftick == 0 && !activeItem) {
      randomItem(pickRandom(effects, 1)[0]);
    } else if(score % halftick / 2 == 0) {
      randomItem("point");
    }
  }
}

// inicrement labels
function labelHandler() {
  if(score % tick == 0)
    labelLevel.innerText = "Level: " + level++;

  // finally, update the score label
  labelScore.innerText = "Score: " + score++;

}


// SPECIAL GAME FUNCTIONS AFTER LEVEL 10
//  all level events will now be in terms of half tick to speed up the game
function dark(level) {
  // this fades the screen at level 9 and changes to the black pallete
  if(score == level) {
    document.body.classList.add("darken");
    canvas.classList.add("transparent");

    // make sure the player doesn't panic
    overlayBlack.classList.toggle("popup-open");
    overlayBlack.classList.toggle("popup-closed");
    
    blocks = []; // delete all the blocks

    // after 1 second, turn off the panic message and clear the board
    setTimeout(function() {
      overlayBlack.classList.toggle("popup-open");
      overlayBlack.classList.toggle("popup-closed");
      clear(); // clear the board
    },1300);

    // put the player on the board
    drawBlock(player);
  }

  // bring the canvas back into view
  if(score == level + tick * .15) {
    canvas.classList.remove("transparent");
    clear_color = BLACK;
  } 
}

// stop all blocks in place and then reverse them
function reversal(level) {
  // slow down all the blocks for a quarter tick
  if(score > level - halftick && score < level - halftick / 2) {
    clutter();
    for(i in blocks) {
      blocks[i].speed *= .4; 
    }
  }

  // freeze the blocks in place
  if(score == level - halftick / 2) {
    if(difficulty < 3 && score > levels[10]) {
      gap = 28;
      height_limiter = .5;
    }

    for(i in blocks) {
      flip(blocks[i]);

      blocks[i].speed = randomSpeed * 1.4;
    }
    
    if(lastUsed == "reverse") {
      lastUsed = "";
    }
  }
}



// this will loop infinitely after level 9
function infinite(level) {
  var level2 = level + tick; // relative to level 11
  var level3 = level + tick * 2; // relative to level 12
  var level4 = level + tick * 3; // relative to level 13
  var level5 = level + tick * 4; // relative to level 14
  
  if(score == level + 1)
    console.log("Starting infinite segment for " + level);

  if(score > level && score < level2 - halftick) {
      randomBlock(randomSpeed, direction.UP);
    }
  if(score > level2 - halftick && score < level2) {
    randomBlock(randomSpeed, direction.LEFT);
  }
  if(score > level2 && score < level3 - halftick) {
    randomBlock(randomSpeed, direction.DOWN);
  }
  if(score > level3 - halftick && score < level3) {
    randomBlock(randomSpeed, direction.RIGHT);
  }

  if(score > level3 && score < level4 - halftick) {
    clutter();
  }

  if(score > level3)
    reversal(level4); // some quick magic to wow the players

  if(score > level4 && score < level5) {
    clutter();
  }

  if(score == level4)
    console.log("Ending segment for " + level);
}