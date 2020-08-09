/***************************** BLOCK GAME *****************************/

var cheat = false; // set this to true to cheat

// page elements
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var labelSore = document.getElementById("labelScore");

var overlay = document.getElementById("overlay");
var labelOverlay = document.getElementById("labelOverlay");
var labelLevel = document.getElementById("labelLevel");



// colors
const TRANSPARENT = "rgba(255, 255, 255, 0)";
const WHITE = "WHITE";
const BLACK = "BLACK";

const BLUE = "rgb(3,169,244)";
const BLUE_T = "rgba(3,169,244,.5)";

const ORANGE = "rgb(244,67,54)";
const ORANGE_T = "rgba(244,67,54,.5)";

const GREEN = "rgb(76,175,80)";
const GREEN_T = "rgba(76,175,80,.5)";

const PINK = "rgb(233,30,99)";
const PINK_T = "rgba(233,30,99,.5)";

const AQUA = "#00f1c8";
const AQUA_T = "rgba(0,241,200,.5)";

const DARK_BLUE = "#003d9e";
const LIME = "#3aff5f";

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

const colors = [ORANGE, GREEN, PINK, AQUA];
var clear_color = WHITE;

// general block information
var BLOCK_SIZE = 20; // arbitrary
var STARTING_XY = (canvas.height / 2) - (BLOCK_SIZE / 2); // center of the page

var player; // will be initialized as a Block object in the reset() function
var playing = false; // true if game is in play
var PLAYER_COLOR = BLUE;

var items = []; // random items
var blocks = []; // random blocks
var randomSpeed = 6; // base speed for random blocks
var randomDirections; // random directions for random blocks

var time;
var gap;
var score;
var level;

var MAX_LEVEL_AMOUNT = 16;
var levels = [0, 30, 60, 180]; // default levels
var multiplier;

// direction enum keycodes
const direction = { 
  UP : 38,
  DOWN : 40,
  LEFT : 37,
  RIGHT : 39,
  ALL : "ALL"
}
const directions = [direction.UP, direction.DOWN, direction.LEFT, direction.RIGHT];

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
}

// clear canvas
function clear() {
  ctx.fillStyle = clear_color;
  ctx.fillRect(0, 0, canvas.height, canvas.width);
}

// draw a block on the page
function drawBlock(b) {
  ctx.fillStyle = b.color;
  ctx.fillRect(b.x, b.y, b.width, b.height);
}

// move in the direction 
function move(key) {
  switch(key) {
    case direction.UP:
      console.log("UP");
      if(player.y > 1) {
        player.y -= player.speed;
      }
      break;
    case direction.DOWN:
      console.log("DOWN");
      if(player.y + player.height < canvas.height)  {
        player.y += player.speed;
      }
      break;
    case direction.LEFT:
      console.log("LEFT");
      if(player.x > 1) {
        player.x -= player.speed;
      }
      break;
    case direction.RIGHT:
      console.log("RIGHT");
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

  if(playing)
    move(key);

  // spacebar or enter starts game
  if(!playing && (key == 32 || key == 13)) {
    console.log("Keyboard start")
    start();
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

/***************************** GAME CONTROL *****************************/

var effects = ["slow","clear"];
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
  }

  item.state = state;
  items.push(item);
  console.log(item);
}

var activeItem;
var tempSpeed;
var tempScore;
// method to consume an item
function useItem(block) {
  tempSpeed = randomSpeed;
  tempScore = score;
  activeItem = true;

  switch(block.state) {
    case "slow":
      randomSpeed *= .66;
      for(i in blocks) {
        blocks[i].speed = randomSpeed;
      }
      activeItem = true;
      break;
    case "clear":
      for(i in blocks) {
        blocks[i].collide = false;
        blocks[i].color = colorMatch(blocks[i].color);
      }
      break;
  }

  items.pop();
}

// create a random object
function randomBlock(speed, state) {
  var MAX_AMOUNT = canvas.width / BLOCK_SIZE;
  var MAX_HEIGHT = canvas.height * .80;

  var RANDOM_X = Math.floor(Math.random() * MAX_AMOUNT) * BLOCK_SIZE;
  var RANDOM_HEIGHT = Math.floor(Math.random() * MAX_HEIGHT) + canvas.height * .1;

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

// call this update once every tick
function updateTick() {
  // levels 0-3, hard code default direcitons
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

  // levels 4-7, pick two different random directions for each level
  if(score >= levels[4] && score % multiplier == 0) {
    console.log("Random directions @ " + score);
    randomDirections = pickRandom(directions, 2);
  }

  // SPECIAL LEVEL 10+
  // levels 8+, blocks from all four directions
  if(score > levels[8] && score < levels[9]) {
    randomBlock(randomSpeed, direction.UP);
    randomBlock(randomSpeed, direction.DOWN);
    randomBlock(randomSpeed, direction.LEFT);
    randomBlock(randomSpeed, direction.RIGHT);
  }

  // generate the random blocks with the randomly directions
  if(score > levels[4] && score < levels[8]) {
    randomBlock(randomSpeed, randomDirections[0]);
    randomBlock(randomSpeed, randomDirections[1]);
  }

  // !!! increment the speed every 3 levels
  if(score < levels[10] && score % (multiplier * 4) == 0) {
    console.log("Speed increase");
    randomSpeed++;
  }
  
  // slow down all the blocks since it will be coming from all foru directions
  if(score == levels[8]) {
    gap = 32;
    randomSpeed--;
  }

  // after level 12, increase the amount of blocks and speed
  if(score >= levels[10] && score % (multiplier * 4) == 0) {
    console.log("Lowering gap @ " + score);
    gap--;
  }

  if(score % multiplier == 0) {
    labelLevel.innerText = "Level: " + level++;
  }

  if(score > levels[4] && score % (multiplier / 2) == 0 && items.length == 0) {
    if(!activeItem)
      randomItem(pickRandom(effects,1)[0]);
  }

  if(tempScore + multiplier / 2 == score) {
    randomSpeed = tempSpeed;
    activeItem = false;
  }
  
 // SPECIAL FADE THE SCREEN AT LEVEL 10
  if(score >= levels[9]) {
    flash();
  }
  
  labelScore.innerText = "Score: " + score++;
}

function flash() {
  var blockThreshold = levels[9] + multiplier * .5

  if(score == levels[9]) {
    document.body.classList.add("darken");
    canvas.classList.add("transparent");
    
    blocks = [];

    setTimeout(function() {
      clear();
    },1000);

    drawBlock(player);
  }

  // UNFADE THE CANVAS AT LEVEL 10
  if(score == levels[9] + multiplier * .15) {
    canvas.classList.remove("transparent");
    clear_color = BLACK;
  } 
  
  if(score == levels[10]) {
    gap = 44;
    randomSpeed += 8;
  }

  if(score > blockThreshold) {

    if(score > levels[10] && score < levels[11]) {
      randomBlock(randomSpeed, direction.UP);
    }
    if(score > levels[11] && score < levels[12]) {
      randomBlock(randomSpeed, direction.RIGHT);
    }
    if(score > levels[12] && score < levels[13]) {
      randomBlock(randomSpeed, direction.LEFT);
    }
    if(score > levels[13] && score < levels[14]) {
      randomBlock(randomSpeed, direction.DOWN);
    }

    if(score > levels[14]) {
      randomBlock(randomSpeed, direction.UP);
      randomBlock(randomSpeed, direction.DOWN);
      randomBlock(randomSpeed, direction.LEFT);
      randomBlock(randomSpeed, direction.RIGHT);
    }

  }
  
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
      console.log("Stop");
      stop();
    }
    
    if(items.length > 0 && collision(items[0], blocks[i]))
      items.pop();
  }

  for(i in items) {
    console.log(items[i]);
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

// break the game loop and log the score
function stop() {
  playing = false;
  console.log("Score: " + score);
  overlay.classList.add("popup-open");
  overlay.classList.remove("popup-closed");
}

// game reset
//  initializer and default dynamic variables
//  reset random blocks
function reset() {
  clear(); // clear the board

  // reset all dynamic variables to defaults
  clear_color = WHITE;
  player = new Block(STARTING_XY, STARTING_XY, BLOCK_SIZE, BLOCK_SIZE, PLAYER_COLOR);
  items = [];
  blocks = [];
  randomSpeed = 3;
  randomDirections = [];
  time = 0;
  gap = 32;
  score = 0;
  level = 1;

  update(); // update with new board
}

// start the game loop
function start() {
  reset();
  overlay.classList.remove("popup-open");
  overlay.classList.add("popup-closed");
  document.body.classList.remove("darken");
  canvas.classList.remove("transparent");
  playing = true;
  
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
function setLevelMultiplier(n) {
  multiplier = n;
  for(i = 0; i < MAX_LEVEL_AMOUNT; i++) {
    levels[i] = i * n;
  }
  console.log(levels);
}




cheat = false;


reset();
setLevelMultiplier(20);