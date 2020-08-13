/***************************** GAME FLOW *****************************/

// call this update once every tick
function updateTick() {

  // run the correct level handlers for each mode
  switch(mode) {
    case 0: // the only difference between 0 and 1 are the spee differences
    case 1:
      original()
      speedHandler()
      break;
    case 2:
      endurance();
      break;
    case 3:
      cluster();
      break;
    case 4:
      maxMode();
      break;
  }

  /******* handlers for items and labels *******/
  itemHandler();
  labelHandler();
}



/***************************** HANDLERS *****************************/

// increase the speed every 4 levels
function speedHandler() {
  // !!! increment the speed every 4 levels until 
  if(score < (tick * 16) && score % (tick * 4) == 0 && score > 0) {
    console.log("Speed increase");
    randomSpeed++;
  }
}

// put on an item on the board every half tick
function itemHandler() {
  // disable random items for a half tick after activation
  //  disable effects of previous item after a half tick

  if((bonus % 4 == 0 ||  bonus % 7 == 0 || bonus % 11 == 0) && bonus > 0) {
    if(player.state != "life")
      labelBonus.classList.add("label-bonus");

    bonus++;
    player.state = "life";
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
  if((score > (tick * 4) || mode == 4 || mode == 3) && items.length < 1) {
    if((score % halftick == 0 || mode == 4) && !activeItem) {
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



/***************************** DARK TRANSITION *****************************/

// SPECIAL GAME FUNCTIONS AFTER LEVEL 10
//  all level events will now be in terms of half tick to speed up the game
function dark(level_n) {
  // this fades the screen at level 9 and changes to the black pallete
  if(score == level_n) {
    document.body.classList.add("darken");
    canvas.classList.add("transparent");

    //make sure the player doesn't panic
    overlayBlack.classList.toggle("popup-open");
    overlayBlack.classList.toggle("popup-closed");
    
    //if(mode != 4)
    //  canvas.width = 640;

    blocks = []; // delete all the blocks
    
    clear(); // clear the board

    // after 1 second, turn off the panic message and clear the board
    setTimeout(function() {
      overlayBlack.classList.toggle("popup-open");
      overlayBlack.classList.toggle("popup-closed");
    },1000);

    // put the player on the board
    drawBlock(player);
  }

  // bring the canvas back into view and invert clear color
  if(score == level_n + tick * .15) {
    clear_color = BLACK;
    canvas.classList.remove("transparent");
  } 
}



/***************************** LEVEL GENERATION *****************************/

// generate blocks between level and level + tick in a single direction
function generateSingle(level, direction) {
  if(score >= level && score < level + tick) {
    randomBlock(randomSpeed, direction);
  }
}

// FOUR CONSECUTIVE LEVELS: generate blocks going in the same direction
function fourSingle(level_n, lasers = false) {
  // level is starting point 0
  // relative level notation: if n was level 1, then the following levels are like this:
  var level_a = level_n + tick * 1;
  var level_b = level_n + tick * 2;
  var level_c = level_n + tick * 3;

  generateSingle(level_n, direction.DOWN);
  generateSingle(level_a, direction.UP);
  generateSingle(level_b, direction.LEFT);
  generateSingle(level_c, direction.RIGHT);

  var quarter = score % (halftick / 2) == 0;

  if(lasers) {
    if(score >= level_n && score < level_a && quarter) {
      randomLaser(direction.RIGHT);
      randomLaser(direction.LEFT);
    }
    if(score >= level_a && score < level_b && quarter) {
      randomLaser(direction.RIGHT);
      randomLaser(direction.LEFT);
    }
    if(score >= level_b && score < level_c && quarter) {
      randomLaser(direction.UP);
      randomLaser(direction.DOWN);
    }
    if(score >= level_c && quarter) {
      randomLaser(direction.UP);
      randomLaser(direction.DOWN);
    }
  }
}

// FOUR CONSUCUTIVE LEVELS: generate blocks going in two different directions
function fourDouble(level_n, lasers = false) {
  var level_5 = level_n + tick * 4;
   
  // level change can be checked detected by checking if score divides the tick evenly
  // pick two different random directions for each level change
  if(score >= level_n && score % tick == 0) {
    console.log("Random directions @ " + score);
    randomDirections = pickRandom(directions, 2);
  }

  // generate the random blocks with the randomly directions
  if(score > level_n && score < level_5) {
    randomBlock(randomSpeed, randomDirections[0]);
    randomBlock(randomSpeed, randomDirections[1]);
  }

  if(lasers) {
    if(score % (halftick / 2) == 0 && score <= tick * 7) {
      randomLaser(randomDirections[0]);
      randomLaser(randomDirections[1]);
    }
  }
}


function randomThree() {
  randomBlock(randomSpeed, randomDirections[0]);
  randomBlock(randomSpeed, randomDirections[1]);
  randomBlock(randomSpeed, randomDirections[2]);
}

// initiates looped level generation starting from level_n
function infinite(level_n) {
  if(score == level_n)
    referencePoint = score;

  if(score >= level_n) {
    // continuously update the reference point so the same actions
    // repeat every 4 ticks
    if(score == referencePoint + tick * 4) {
      referencePoint = score;
      gap--;
      randomSpeed++;
    }
    generateLoop(referencePoint);
  }
}

// this will generate a loop for four levels
// each event occurs at half ticks
function generateLoop(level_n) {
  var level_a = level_n + tick; 
  var level_b = level_n + tick * 2;
  var level_c = level_n + tick * 3; 
  var level_d = level_n + tick * 4;
  
  if(score == level_n) {
    console.log("Starting looped segment @ " + level_n);
    bonus++;
  }

  if(score > level_n && score < level_a - halftick)
    randomBlock(randomSpeed, direction.UP);

  if(score > level_a - halftick && score < level_a)
    randomBlock(randomSpeed, direction.LEFT);
  
  if(score > level_a && score < level_b - halftick)
    randomBlock(randomSpeed, direction.DOWN);

  if(score > level_b - halftick && score < level_b)
    randomBlock(randomSpeed, direction.RIGHT);
  
  // single reversal from b to c
  if(score > level_b)
    reversal(level_c);

  if(score > level_b && score < level_c - halftick)
    clutter();

  if(score >= level_c && score < level_d)
    clutter();

  if(score == level_d - 1) {
    console.log("Ending looped segment @ " + level_n);
    freeLife();
  }
}

// stop all blocks in place and then reverse them
function reversal(level) {
  // slow down all the blocks for a quarter tick
  if(score > level - halftick && score < level - halftick / 2) {
    clutter();
    for(i in blocks) {
      if(blocks[i].collide)
        blocks[i].speed *= .4; 
    }
  }

  // freeze the blocks in place
  if(score == level - halftick / 2) {

    // flip the block directions and apply new speed
    for(i in blocks) {
      if(blocks[i].collide)
        flip(blocks[i]);
      blocks[i].speed = randomSpeed * 1.4;
    }
    
    if(lastUsed == "reverse") {
      lastUsed = "";
    }
  }
}

// create a random laser using the laser function
function randomLaser(blockDirection) {
  var MAX_AMOUNT_X = canvas.width / BLOCK_SIZE;
  var MAX_AMOUNT_Y = canvas.height / BLOCK_SIZE
  var MAX_HEIGHT = canvas.height * height_limiter;

  var RANDOM_X = Math.floor(Math.random() * MAX_AMOUNT_X) * BLOCK_SIZE;
  var RANDOM_Y = Math.floor(Math.random() * MAX_AMOUNT_Y) * BLOCK_SIZE;
  var RANDOM_HEIGHT = Math.floor((Math.random() * MAX_HEIGHT) + canvas.height * .1);

  if(blockDirection == direction.UP || blockDirection == direction.DOWN) {
    laser(blockDirection, RANDOM_X);
  } else if(blockDirection == direction.LEFT || blockDirection == direction.RIGHT) {
    laser(blockDirection, RANDOM_Y);
  }
}

// target a laser at a block
function targetLaser(blockDirection, target) {
  switch(blockDirection) {
    case direction.UP:
    case direction.DOWN:
      laser(blockDirection, target.x);
      break;
    case direction.LEFT:
    case direction.RIGHT:
      laser(blockDirection, target.y);
      break;
  }
}

// determine a direction and a position to shoot a "laser" in
function laser(blockDirection, position) {
  var placeholder;
  var block;

  var randomColor = pickRandom(colors,1)[0];
  var randomTransparent = colorMatch(randomColor);

  var extended_width = canvas.width * randomSpeed * 1.15;
  var extended_height = canvas.height * randomSpeed * 1.15;

  switch(blockDirection) {
    case direction.UP:  
      placeholder = new Block(position, canvas.height, BLOCK_SIZE, extended_height, randomTransparent);
      block = new Block(position, extended_height + canvas.height, BLOCK_SIZE, canvas.height, randomColor);
      break;
    case direction.DOWN:  
      placeholder = new Block(position, 0 - extended_height, BLOCK_SIZE, extended_height, randomTransparent);
      block = new Block(position, 0 - extended_height - canvas.height, BLOCK_SIZE, canvas.height, randomColor);
      break;
    case direction.LEFT:
      placeholder = new Block(canvas.width, position, extended_width, BLOCK_SIZE, randomTransparent);
      block = new Block(extended_width + canvas.width, position, canvas.width, BLOCK_SIZE, randomColor);
      break;
    case direction.RIGHT:
      placeholder = new Block(0 - extended_width, position, extended_width, BLOCK_SIZE, randomTransparent);
      block = new Block(0 - extended_width - canvas.width, position, canvas.width, BLOCK_SIZE, randomColor);
      break;
  }

  placeholder.speed = randomSpeed * randomSpeed + 10;
  placeholder.state = blockDirection;
  placeholder.collide = false;
  block.speed = randomSpeed * randomSpeed + 10;
  block.state = blockDirection;

  blocks.push(placeholder);
  blocks.push(block);
}

function freeLife() {
  console.log("Free life @ " + score);
  labelBonus.classList.add("label-bonus");
  player.state = "life";
  player.color = PLAYER_YELLOW;
}