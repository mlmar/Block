/***************************** BLOCK GAME *****************************/

var cheat = false; // set this to true to cheat

// page elements
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var labelSore = document.getElementById("labelScore");

var overlaySettings = document.getElementById("overlaySettings");
var overlayBlack = document.getElementById("overlayBlack");
var overlay = document.getElementById("overlay");
var labelOverlay = document.getElementById("labelOverlay");
var labelLevel = document.getElementById("labelLevel");

// colors
const TRANSPARENT = "rgba(255, 255, 255, 0)";
const WHITE = "WHITE";
const BLACK = "BLACK";

const BLUE = "rgb(3,169,244)";
const BLUE_T = "rgba(3,169,244,.3)";

const ORANGE = "rgb(244,67,54)";
const ORANGE_T = "rgba(244,67,54,.3)";

const GREEN = "rgb(76,175,80)";
const GREEN_T = "rgba(76,175,80,.3)";

const PINK = "rgb(233,30,99)";
const PINK_T = "rgba(233,30,99,.3)";

const AQUA = "#00f1c8";
const AQUA_T = "rgba(0,241,200,.3)";

const DARK_BLUE = "rgb(0, 61, 158)";
const LIME = "rgb(58, 255, 95)";
const YELLOW = "rgb(255, 204, 102)";
const PLAYER_YELLOW = "rgb(255, 204, 20)";

// match the regular colors to their transparent counterparts
function colorMatch(c) {
  switch(c) {
    case BLUE:
      return BLUE_T;
    case ORANGE: 
      return ORANGE_T;
    case GREEN: 
      return GREEN_T;
    case PINK: 
      return PINK_T;
    case AQUA: 
      return AQUA_T;
    default:
      return BLUE_T;  
  }
}

var clear_color = WHITE; // canvas background should be white

// general block information
var BLOCK_SIZE = 20; // arbitrary
var STARTING_XY = (canvas.height / 2) - (BLOCK_SIZE / 2); // center of the page

var player; // will be initialized as a Block object in the reset() function
var playing = false; // true if game is in play
var PLAYER_COLOR = BLUE; // default player color

// stacks for generation of random items and random blockss
var items = []; // random items
var blocks = []; // random blocks
var randomSpeed = 3; // base speed for random blocks
var randomDirections; // random directions for random blocks
var height_limiter = .8 // dictate maximum height of random blocks in proportion to canvas height

// dynamic game control variables
var time; // increment time by 1 every game loop
var gap; // gap between generations of a random block
var score; // keeping track of score -- dictates level
var level; // every "mutliplier", level increases

// setting the score distance between each level
//  call setLevelTick before starting
var MAX_LEVEL_AMOUNT = 16; // preprogrammedd levels 0-14
var tick; // score in between each level
var halftick; // half a tick
var levels = [] // each level is i * tick

var referencePoint; // will be used to calculate elapsed time for infinite runs


// for item usage
var lastUsed = "";
var activeItem;
var originalSpeed; // used to return to original speed
var originalScore; // used to meassure when a halftick has passed


const ESCAPE = 27;
const SPACE = 32;
// direction enum keycodes
const direction = { 
  UP : 38,
  DOWN : 40,
  LEFT : 37,
  RIGHT : 39,
  W: 87,
  S: 83,
  A: 65,
  D: 68
}
const directions = [direction.UP, direction.DOWN, direction.LEFT, direction.RIGHT];

// KNOWN BUG: pressing space multiple times during the reset screen
//            will cal lthe reset method multiple times
// BAND AID SOLUTION: count how many times space was pressed in a buffer
//                    and only run on the first press
var buffer = 0; 

/***************************** PRIMARY METHODS *****************************/

// Block object for player and blocks
//  params: position x, position y, height, width, color
var Block = function(x, y, width, height, color) {
  this.x = x; // top left x coordinate
  this.y = y; // top left y coordinate

  this.x2 = x + width; // top right x coordinate
  this.y2 = y + height; // bottom left y coordinate

  this.width = width;
  this.height = height;
  

  this.speed = 20; // default speed

  this.color = color;
  this.state; // block state
  
  this.collide = true;

  this.text = "";
}

// clear canvas
function clear() {
  ctx.fillStyle = clear_color;
  ctx.fillRect(0, 0, canvas.height, canvas.width);
}

// draw a block on the page
function drawBlock(b) {
  ctx.fillStyle = b.color;
  if(b.text == "") {
    ctx.fillRect(b.x, b.y, b.width, b.height);
  } else {
    ctx.font = "3rem Impact"
    ctx.fillText(b.text, b.x, b.y, b.width);
  }
}

// move in the direction 
function move(key) {
  switch(key) {
    case direction.W:
    case direction.UP:
      if(player.y > 1) {
        player.y -= player.speed;
      }
      break;
    case direction.S:
    case direction.DOWN:
      if(player.y + player.height < canvas.height)  {
        player.y += player.speed;
      }
      break;
    case direction.A:
    case direction.LEFT:
      if(player.x > 1) {
        player.x -= player.speed;
      }
      break;
    case direction.D:
    case direction.RIGHT:
      if(player.x + player.width < canvas.width) {
        player.x += player.speed;
      }
      break;
  }

  player.y2 = player.y + player.height;
  player.x2 = player.x + player.width;
}

// get currently pressed key and pass it to the move function
window.onkeydown = function(event) {
  var key = event.keyCode;

  if(playing) {
    move(key);
  } else if(!playing && (key == SPACE)) { // space bar to start game
    if(buffer == 0) { // only run on the first space press
      buffer++; // increment everytime space was presed
      reset(); // reset screen --> start game
    }
  } else if(key == ESCAPE) {
    settings();
  }
}

function moveRandom(block) {
  switch(block.state) {
    case direction.UP:
      block.y -= block.speed;
      break;
    case direction.DOWN:
      block.y += block.speed;
      break;
    case direction.LEFT: 
      block.x -= block.speed;
      break;
    case direction.RIGHT:
      block.x += block.speed;
      break;
  }

  blocks[i].y2 = blocks[i].y + blocks[i].height;
  blocks[i].x2 = blocks[i].x + blocks[i].width;
}

// check the state of the oldest block -- the first block
function deleteOutOfFrame(first) {
  switch(first.state) {
    case direction.UP:
      if(first.y2 < 0)
        blocks.shift();
      break;
    case direction.DOWN:
      if(first.y > canvas.height)
        blocks.shift();
      break;
    case direction.LEFT:
      if(first.x2 < 0)
        blocks.shift();
      break;
    case direction.RIGHT:
      if(first.x > canvas.width)
        blocks.shift();
      break;
  }
}

// see if a smaller block is on top of another block
function collision(b1, b2) {
  
  // top of b1 within b2's top and bottom
  var top = ((b2.y <= b1.y) && (b1.y <= b2.y2)); 
  // bottom of b1 within b2's top and bottom
  var bottom = ((b2.y <= b1.y2) && (b1.y2 <= b2.y2));

  // left of b1 within b2's left and right
  var left = ((b2.x <= b1.x) && (b1.x <= b2.x2));
  // right of b2 within b2's left and right;
  var right = ((b2.x <= b1.x2) && (b1.x2 <= b2.x2));
  
  // alternate
  var left_right = ((b1.x == b2.x) && (b1.x2 == b2.x2));
  var top_bottom = ((b1.y == b2.y) && (b1.y2 == b2.y2));
  var collision = 
    top && left_right || 
    bottom && left_right || 
    left && top_bottom || 
    right && top_bottom;

  if(collision) {
    console.log(b1);
    console.log(b2);
  }

  return collision;
}


// get a random nubmer between min and max, min inclusive
function getRandom(min, max) {
  return Math.floor(Math.random() * max) + min;
}

// pick an amount of random elements from a list and return as a list
function pickRandom(list, amount) {
  var generated = [];
  var item;
  for(i = 0; i < amount; i++) {
    // don't get the same number twice
    item = list[getRandom(0, list.length)]
    while(i > 0 && item == generated[i-1]) {
      item = list[getRandom(0, list.length)]
    }

    generated.push(item);
  }
  console.log("Randomly generated " + list + ":\n" + generated);
  return generated;
}

/***************************** GAME FLOW *****************************/

/****** item methods ******/

var effects = ["slow", "clear", "life"];
// create a randomItem
function randomItem(state) {
  var MAX_X = canvas.width / BLOCK_SIZE;
  var MAX_Y = canvas.height / BLOCK_SIZE;
  var RANDOM_X = Math.floor(Math.random() * MAX_X) * BLOCK_SIZE;
  var RANDOM_Y = Math.floor(Math.random() * MAX_Y) * BLOCK_SIZE;

  var item;
  switch(state) {
    case "slow":
      item = new Block(RANDOM_X, RANDOM_Y, BLOCK_SIZE, BLOCK_SIZE, DARK_BLUE);
      break;
    case "clear":
      item = new Block(RANDOM_X, RANDOM_Y, BLOCK_SIZE, BLOCK_SIZE, LIME);
      break;
    case "life":
      item = new Block(RANDOM_X, RANDOM_Y, BLOCK_SIZE, BLOCK_SIZE, YELLOW)
      break;
  }

  item.state = state;
  items.push(item);
  console.log(item);
}

// method to consume an item
function useItem(block) {
  originalScore = score;
  activeItem = true;

  switch(block.state) {
    case "slow":
      originalSpeed = randomSpeed; // save original speed
      randomSpeed *= .66; // slow down to 66% of original speed
      for(i in blocks) { // modify all existing speeds
        blocks[i].speed = randomSpeed;
      }
      break;
    case "clear":
      for(i in blocks) {
        blocks[i].collide = false; // turn of collision for existing blocks
        blocks[i].color = colorMatch(blocks[i].color); // transparent blocks
      }
      break;
    case "life":
      player.state = "life";
      player.color = PLAYER_YELLOW;
      break;
  }

  activeItem = true;
  lastUsed = block.state;

  items.pop();
}

/****** end item methods ******/

// create a random block with speed and direction (velocity)
function randomBlock(speed, state) {
  var MAX_AMOUNT = canvas.width / BLOCK_SIZE;
  var MAX_HEIGHT = canvas.height * height_limiter;

  var RANDOM_X = Math.floor(Math.random() * MAX_AMOUNT) * BLOCK_SIZE;
  var RANDOM_HEIGHT = Math.floor((Math.random() * MAX_HEIGHT) + canvas.height * .1);

  var block;
  
  switch(state) {
    case direction.UP: // blocks generate below the screen
      block = new Block(RANDOM_X, canvas.height + RANDOM_HEIGHT, BLOCK_SIZE, RANDOM_HEIGHT, AQUA);
      break;
    case direction.DOWN: // blocks generate above the screen
      block = new Block(RANDOM_X, 0 - RANDOM_HEIGHT, BLOCK_SIZE, RANDOM_HEIGHT, PINK);
      break;
    case direction.LEFT: // blocks generate to the right of the screen
      block = new Block(canvas.width + RANDOM_HEIGHT, RANDOM_X, RANDOM_HEIGHT, BLOCK_SIZE, GREEN);
      break;
    case direction.RIGHT: // blocks geenerate to the left of the screen
      block = new Block(0 - RANDOM_HEIGHT, RANDOM_X, RANDOM_HEIGHT, BLOCK_SIZE, ORANGE);
      break;
  }
  
  block.speed = speed;
  block.state = state;

  blocks.push(block);
}

// send random blocks from all four directions
function clutter() {
  randomBlock(randomSpeed, direction.UP);
  randomBlock(randomSpeed, direction.DOWN);
  randomBlock(randomSpeed, direction.LEFT);
  randomBlock(randomSpeed, direction.RIGHT);
}

// call this update once every tick
function updateTick() {
  
  /******* levels 1-4 *******/

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

  /******* level 4-7 *******/

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


  /******* levels 8-10 *******/

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
    dark();
  }

  /******* levels 10+ *******/

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
  
  /******* level 14+ loop infinitely *******/

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


  /******* speed handler *******/
  speedHandler();

  /******* random items *******/
  itemHandler();

  /******* score and level labels *******/
  labelHandler();
}

function speedHandler() {
  // !!! increment the speed every 4 levels until 
  if(score < levels[16] && score % (tick * 4) == 0) {
    console.log("Speed increase");
    randomSpeed++;
  }
}

function itemHandler() {
  // disable random items for a half tick after activation
  //  disable effects of previous item after a half tick
  if(originalScore + halftick == score) {
    if(lastUsed == "slow")
      randomSpeed = originalSpeed;
    lastUsed = "";
    activeItem = false;
  }

  // every half tick after level 4, place a random item on the screen
  if(score > levels[4] && score % halftick == 0 && !activeItem && items.length == 0) {
    randomItem(pickRandom(effects, 1)[0]);
  }
}

function labelHandler() {
  if(score % tick == 0) {
    labelLevel.innerText = "Level: " + level++;
  }

  // finally, update the score label
  labelScore.innerText = "Score: " + score++;

}


// SPECIAL GAME FUNCTIONS AFTER LEVEL 10
//  all level events will now be in terms of half tick to speed up the game
function dark() {
  // this fades the screen at level 9 and changes to the black pallete
  if(score == levels[9]) {
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
    },1000);

    // put the player on the board
    drawBlock(player);
  }

  // bring the canvas back into view
  if(score == levels[9] + tick * .15) {
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
    gap = 28;
    height_limiter = .5;
    for(i in blocks) {
      blocks[i].speed = randomSpeed * -1 - 10;
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

// update the page with new positions of all blocks
function update() {
  clear();
  drawBlock(player);

  // update coordinates of random blocks
  for(i in blocks) {
    moveRandom(blocks[i]);
    drawBlock(blocks[i]);

    if(blocks[i].collide && collision(player, blocks[i]) && !cheat) {
      if(player.state == "life") {
        blocks[i].collide = false;
        blocks[i].color = colorMatch(blocks[i].color);
        player.state = "";
        player.color = BLUE;
      } else {
        console.log("Stop");
        stop();
      }
    }
    
    if(items.length > 0 && collision(items[0], blocks[i]))
      items.pop();
  }

  for(i in items) {
    drawBlock(items[i]);

    if(collision(player, items[i])) {
      console.log("Item collision");
      useItem(items[i]);
    }
  }

  // only create a block every tick
  // 1 tick = time % gap;
  if(time++ % gap == 0)
    updateTick();

  if(blocks.length > 0)
    deleteOutOfFrame(blocks[0]) // clear oldest block when ready
}

/***************************** GAME CONTROL *****************************/

// break the game loop and log the score
function stop() {
  playing = false;
  console.log("Score: " + score);
  overlay.classList.add("popup-open");
  overlay.classList.remove("popup-closed");
}



function transition() {
  if(blocks.length > 0) {
    clear();
    for(i in blocks) {
      moveRandom(blocks[i]);
      drawBlock(blocks[i]);
    } 

    deleteOutOfFrame(blocks[0]);
    window.requestAnimationFrame(transition);
  } else {
    start();
  }
}

// game reset
//  initializer and default dynamic variables
//  reset random blocks
function reset() {
  for(i in blocks) {
    blocks[i].state = direction.DOWN;
    blocks[i].speed = 16;
  }

  window.requestAnimationFrame(transition);
}

function resetValues() {
  clear(); // clear the board

  // reset all dynamic variables to defaults
  clear_color = WHITE;
  player = new Block(STARTING_XY, STARTING_XY, BLOCK_SIZE, BLOCK_SIZE, PLAYER_COLOR);
  items = [];
  blocks = [];
  randomSpeed = 3;
  randomDirections = [];
  height_limiter = .8
  time = 0;
  gap = 32;
  score = 0;
  level = 1;

  referencePoint = 0;
  lastUsed = "";

  buffer = 0;

  update(); // update with new board
}

// start the game loop
function start() {
  console.log("Starting game " + blocks);

  playing = true;
  resetValues();
  
  overlay.classList.remove("popup-open");
  overlay.classList.add("popup-closed");
  document.body.classList.remove("darken");
  canvas.classList.remove("transparent");
  
  window.requestAnimationFrame(gameLoop);
}

// main game loop
//  continuously update the canvas while playing
function gameLoop() {
  update();

  // request animation will call a funciton when screen is ready for next repaint
  if(playing)
    window.requestAnimationFrame(gameLoop);
}

/***************************** CUSTOMIZE *****************************/

// increment between each level
function setLevelTick(n) {
  tick = n;
  halftick = n / 2;
  for(i = 0; i < MAX_LEVEL_AMOUNT; i++) {
    levels[i] = i * n;
  }
  console.log(levels);
}

function settings() {
  overlaySettings.classList.toggle("popup-open");
  overlaySettings.classList.toggle("popup-closed");
}


cheat = false;
resetValues();
setLevelTick(20);