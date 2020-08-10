/***************************** BLOCK GAME *****************************/

var ex20 = false;

// page elements
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");


// settings elements
var overlaySettings = document.getElementById("overlaySettings");
var disclaimer = document.getElementById("disclaimer");
var list = document.getElementById("list");
var slider = document.getElementById("slider");
var labelDif = document.getElementById("labelDif");

// black screen fade for level 9-10
var overlayBlack = document.getElementById("overlayBlack");

// press space to start
var overlay = document.getElementById("overlay");

// bottom labels
var labelScore = document.getElementById("labelScore");
var labelBonus = document.getElementById("labelBonus");
var labelLevel = document.getElementById("labelLevel");
var labelTotal = document.getElementById("labelTotal");

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
const PINKISH = "rgb(252, 3, 194)";
const GRAY = "rgb(156, 156, 156)";
const PLAYER_YELLOW = "rgb(255, 204, 20)";

const colors = [ORANGE, GREEN, PINK, AQUA];

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
const BLOCK_SIZE = 20; // arbitrary
var STARTING_X = (canvas.width / 2) - (BLOCK_SIZE / 2); // center of the page
var STARTING_Y = (canvas.height / 2) - (BLOCK_SIZE / 2); // center of the page

var player; // will be initialized as a Block object in the reset() function
var playing = false; // true if game is in play
var PLAYER_COLOR = BLUE; // default player color


// variables that directly effect difficutly
var default_gap = 32; // default delay between each block generation
var default_speed = 3; // defualt speed for random block movement
var default_height_limiter // default height limit for random blocks

var difficulty = 0 // modified by settings
const difficulties = ["original","!!","i wanted to release it like this","!!!!","?????"];

// stacks for generation of random items and random blockss
var items = []; // random items
var blocks = []; // random blocks
var randomSpeed = default_speed; // base speed for random blocks
var randomDirections = []; // random directions for random blocks

var height_limiter = default_height_limiter // dictate maximum height of random blocks in proportion to canvas height


// dynamic game control variables
var time = 0; // increment time by 1 every game loop
var gap = default_gap; // gap between generations of a random block
var score = 0; // keeping track of score -- dictates level
var bonus = 0; // bonus score
var level = 1; // every "mutliplier", level increases

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

const ESCAPE = "Escape";
const SPACE = "Space";
// direction enum keycodes
const direction = { 
  UP : "ArrowUp",
  DOWN : "ArrowDown",
  LEFT : "ArrowLeft",
  RIGHT : "ArrowRight",
  W: "KeyW",
  S: "KeyS",
  A: "KeyA",
  D: "KeyD"
}
const directions = [direction.UP, direction.DOWN, direction.LEFT, direction.RIGHT];

// KNOWN BUG: pressing space multiple times during the reset screen
//            will cal lthe reset method multiple times
// BAND AID SOLUTION: count how many times space was pressed in a buffer
//                    and only run on the first press
var buffer = 0; 

/***************************** BLOCK CLASS *****************************/

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

/***************************** RENDERING METHODS *****************************/

// clear canvas
function clear() {
  ctx.fillStyle = clear_color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
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

// check if block is out of frame then delete
function deleteOutOfFrame(first) {
  switch(first.state) {
    case direction.UP:
      if(first.y2 < 0)
        blocks.shift()
      break;
    case direction.DOWN:
      if(first.y > canvas.height)
        blocks.shift()
      break;
    case direction.LEFT:
      if(first.x2 < 0)
        blocks.shift()
      break;
    case direction.RIGHT:
      if(first.x > canvas.width)
        blocks.shift()
      break;
  }
}

// flip a block in the other direction
function flip(block) {
  if(block.state == direction.UP) {
      block.state = direction.DOWN;
  } else if(block.state == direction.DOWN) {
      block.state = direction.UP;
  } else if(block.state == direction.RIGHT) {
      block.state = direction.LEFT;
  } else if(block.state == direction.LEFT) {
      block.state = direction.RIGHT;
  }
}

/***************************** MOVEMENT METHODS *****************************/

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
  var key = event.code;

  if(playing) { // only detect movement keys inputted while playing
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

// move the blocks based on their direction and speed
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


/***************************** DETECTION METHODS *****************************/


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

/***************************** GENERATION METHODS *****************************/

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

// create a random block with speed and direction (velocity)
function randomBlock(speed, state) {
  var MAX_AMOUNT_X = canvas.width / BLOCK_SIZE;
  var MAX_AMOUNT_Y = canvas.height / BLOCK_SIZE
  var MAX_HEIGHT = canvas.height * height_limiter;

  var RANDOM_X = Math.floor(Math.random() * MAX_AMOUNT_X) * BLOCK_SIZE;
  var RANDOM_Y = Math.floor(Math.random() * MAX_AMOUNT_Y) * BLOCK_SIZE;
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
      block = new Block(canvas.width + RANDOM_HEIGHT, RANDOM_Y, RANDOM_HEIGHT, BLOCK_SIZE, GREEN);
      break;
    case direction.RIGHT: // blocks geenerate to the left of the screen
      block = new Block(0 - RANDOM_HEIGHT, RANDOM_Y, RANDOM_HEIGHT, BLOCK_SIZE, ORANGE);
      break;
  }

  if(difficulty >= 4)
    block.color = pickRandom(colors, 1)[0];
  
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


/***************************** ITEM METHODS *****************************/

var effects = ["slow", "slow", "clear", "clear", "life","reverse"];
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
    case "point":
      item = new Block(RANDOM_X, RANDOM_Y, BLOCK_SIZE, BLOCK_SIZE, PINKISH);
      break;
    case "reverse":
      item = new Block(RANDOM_X, RANDOM_Y, BLOCK_SIZE, BLOCK_SIZE, GRAY);
      break;
  }

  item.state = state;
  items.push(item);
  console.log(item);
}

// method to consume an item
function useItem(block, playerBlock = false) {
  originalScore = score;
  activeItem = true;

  switch(block.state) {
    case "slow":
      originalSpeed = randomSpeed; // save original speed
      randomSpeed *= .66; // slow down to 66% of original speed
      for(i in blocks) { // modify all existing speeds
        blocks[i].speed = randomSpeed;
      }
      activeItem = true;
      bonus++;
      break;
    case "clear":
      for(i in blocks) {
        blocks[i].collide = false; // turn of collision for existing blocks
        blocks[i].color = colorMatch(blocks[i].color); // transparent blocks
      }
      activeItem = true;
      bonus++;
      break;
    case "life":
      player.state = "life";
      player.color = PLAYER_YELLOW;
      break;
    case "point":
      bonus += 3;
      break;
    case "reverse":
      activeItem = true;
      bonus += 5;
      break;
  }
  
  if(!playerBlock)
    lastUsed = block.state;
  items.pop();

}


/***************************** RUNS EVERY GAME LOOP *****************************/
// update the state of the board
// check for collisions
// calls updateTick every tick

// update the page with new positions of all blocks
function update() {
  clear();
  drawBlock(player);

  // update coordinates of random blocks
  for(i in blocks) {
    moveRandom(blocks[i]);
    drawBlock(blocks[i]);

    if(blocks[i].collide && collision(player, blocks[i]) && !ex20) {
      if(player.state == "life") {
        blocks[i].collide = false;
        blocks[i].color = colorMatch(blocks[i].color);
        player.state = "";
        player.color = BLUE;
        labelBonus.classList.remove("label-bonus");
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

  // delete oldest block
  if(blocks.length > 0)
    deleteOutOfFrame(blocks[0]);

  labelBonus.innerText = "bonus: " + bonus;

  // only create a block every tick
  // 1 tick = time % gap;
  if(time++ % gap == 0)
    updateTick();
}


/***************************** GAME CONTROL *****************************/

// break the game loop and log the score
function stop() {
  labelTotal.innerText = "final Score: " + (bonus + score - 1);
  playing = false;
  console.log("Score: " + score);
  overlay.classList.add("popup-open");
  overlay.classList.remove("popup-closed");
}



// game reset
//  initiate the reset transition
function reset() {
  for(i in blocks) {
    if(difficulty < 4) {
      blocks[i].state = direction.DOWN;
    } else {
      flip(blocks[i]);
    }
    blocks[i].speed = 16; 
  }

  window.requestAnimationFrame(transition);
}

// reset transition to new game
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

// reset all the game values to its defaults
function resetValues() {
  clear(); // clear the board

  setDifficulty();

  STARTING_X = (canvas.width / 2) - (BLOCK_SIZE / 2); // center of the page
  STARTING_Y = (canvas.height / 2) - (BLOCK_SIZE / 2); // center of the page

  // reset all dynamic variables to defaults
  clear_color = WHITE;
  player = new Block(STARTING_X, STARTING_Y, BLOCK_SIZE, BLOCK_SIZE, PLAYER_COLOR);
  items = [];
  blocks = [];
  randomSpeed = default_speed;
  randomDirections = [];
  height_limiter = default_height_limiter
  time = 0;
  gap = default_gap;
  score = 0;
  bonus = 0
  level = 1;

  labelTotal.innerText = "";

  referencePoint = 0;
  lastUsed = "";

  buffer = 0;

  update(); // update with new board
}

// start the game loop
function start() {
  resetValues();
  
  console.log("Starting game @ ");
  console.log(" default_speed: " + default_speed);
  console.log(" default_gap: " + default_gap);
  
  overlay.classList.remove("popup-open");
  overlay.classList.add("popup-closed");
  document.body.classList.remove("darken");
  canvas.classList.remove("transparent");

  settings(true);
  
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