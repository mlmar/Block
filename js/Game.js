/***************************** BLOCK GAME *****************************/


/**** fastclick.js attachment to body
  Needed fix 300ms delay between presses to detect double tap to zoom
  on IOS. Was able to disable double tap to zoom in <meta> but delay 
  still exists.
*/
if ('addEventListener' in document) {
  document.addEventListener('DOMContentLoaded', function() {
    FastClick.attach(document.body);
  }, false);
}


/**** get main canvas element and context to draw on it ****/
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");


/********* MOBILE DIMENSIONS + IPHONE X SPECIFIC DIMENSIONS *********/
var mobile = window.matchMedia("only screen and (min-width: 320px) and (max-width: 768px) and (orientation: portrait)").matches
console.log("Mobile Device: " + mobile);
canvas.height = mobile ? 780 : 500; // not mobile, use default 500

// if mobile, check if its an iphonex
var iPhoneX = window.matchMedia("only screen and (min-height : 812px) and (orientation: portrait)").matches
console.log("iPhone X: " + iPhoneX);
canvas.height = iPhoneX && mobile ? 900 : canvas.height; // not x, use previous value

var mobileControls = document.getElementById("mobileControls"); // u,d,l,r
mobileControls.style.top = iPhoneX && mobile ? "68vh" : mobileControls.style.top;
/********* END MOBILE DIMENSIONS *********/



// list of gamemodes just for the gamemode label and button
const modes = ["original", "version one", "endurance", "waffle", "experimental"];
var mode = 0 // variable that actually dictates the current mode, default is 0


// elements for settings overay
var overlaySettings = document.getElementById("overlaySettings");
var divMode = document.getElementById("divMode"); // press to change gamemode
var labelMode = document.getElementById("labelMode"); // gamemode label
var disclaimer = document.getElementById("disclaimer"); // general text
var colorPicker = document.getElementById("color"); // player color chooser
var list = document.getElementById("list"); // manual scores list

// used for darken() function to fade the screen to black
var overlayBlack = document.getElementById("overlayBlack");

// overlay that shows "press space to start" and final score
var overlay = document.getElementById("overlay");
var labelTotal = document.getElementById("labelTotal");

// bottom labels
var labelScore = document.getElementById("labelScore");
var labelBonus = document.getElementById("labelBonus");
var labelLevel = document.getElementById("labelLevel");

/**** colors ****/
const TRANSPARENT = "rgba(255, 255, 255, 0)";
const WHITE = "WHITE";
const BLACK = "BLACK";

const BLUE = "rgb(3,169,244)"; // default player color
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
    case BLUE:    return BLUE_T;
    case ORANGE:  return ORANGE_T;
    case GREEN:   return GREEN_T;
    case PINK:    return PINK_T;
    case AQUA:    return AQUA_T;
    default:      return BLUE_T;
  }
}

// default clear color changes depending on device (computer vs mobile)
var default_clear_color = !mobile ? WHITE : BLACK;
var clear_color = default_clear_color; // canvas background should be white

/**** general block information specific to the player ****/
const BLOCK_SIZE = 20; // arbitrary
var STARTING_X = (canvas.width / 2) - (BLOCK_SIZE / 2); // center of the page
var STARTING_Y = (canvas.height / 2) - (BLOCK_SIZE / 2); // center of the page

var player; // will be initialized as a Block object in the reset() function
var playing = false; // true if game is in play
var PLAYER_COLOR = BLUE; // default player color

/**** these defaults are altered in the setMode() function ****/
var default_gap = 32; // default delay between each block generation
var default_speed = 3; // defualt speed for random block movement
var default_height_limiter // default height limit for random blocks
var height_limiter = default_height_limiter // dictate maximum height of random blocks

/**** arrays to hold various types of blocks throughout out the game ****/
var items = []; // holds random item blocks
var blocks = []; // holds the random blocks that player must avoid
var randomSpeed = default_speed; // base speed for random blocks, constantly changed
var randomDirections = []; // random directions for random blocks

var ex20 = false; // arbitrary dev value

// dynamic game control variables
var time = 0; // increment time by 1 every game loop
var gap = default_gap; // gap between generations of a random block
var score = 0; // keeping track of score -- dictates level
var bonus = 0; // bonus score, award extra life
var level = 1; // every tick, level increases

// setting the score distance between each level
//  call setLevelTick before starting
var tick; // score in between each level
var halftick; // half a tick

var referencePoint; // will be used to calculate elapsed score for infinite runs

// for item usage
var lastUsed = "";
var activeItem;
var originalSpeed; // used to return to original speed
var originalScore; // used to meassure when a halftick has passed


/*** ENUMS FOR KEYBOARD INPUT CODES ****/
const ESCAPE = "Escape";
const SPACE = "Space";

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

// used to choose a random direction for random blocks
const directions = [direction.UP, direction.DOWN, direction.LEFT, direction.RIGHT];


// KNOWN BUG: pressing space multiple times during the reset screen
//            will cal lthe reset method multiple times
// BAND AID SOLUTION: count how many times space was pressed in a buffer
//                    and only run on the first press
var buffer = 0;

// always true at the beginning of the game, shows start screen
var screen = true;

/***************************** BLOCK CLASS *****************************/

// Block object for player, blocks and position
//  params: position x, position y, height, width, color
var Block = function(x, y, width, height, color) {
  this.x = x; // top left x coordinate
  this.y = y; // top left y coordinate

  this.x2 = x + width; // top right x coordinate
  this.y2 = y + height; // bottom left y coordinate

  this.width = width;
  this.height = height;
  
  this.speed = BLOCK_SIZE; // default speed

  this.color = color;
  this.state; // block state
  
  this.collide = true; // set to false to turn off block colission

  this.text = ""; // if not empty, drawblock will run fillText()
}

/***************************** RENDERING METHODS *****************************/

// clear canvas
function clear() {
  ctx.fillStyle = clear_color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// draw a block on the page if it is on screen
function drawBlock(b) {
  ctx.fillStyle = b.color;

  if(b.text == "") { // if text is empty, draw the actual block
    ctx.fillRect(b.x, b.y, b.width, b.height);
  } else { // if text is not empty, write the words to screen
    if(!mobile) { // choose a web safe font if on mobile
      ctx.font = !screen ? "3rem Impact" : "1rem Impact";
    } else {
      ctx.font = !screen? "5vh Arial" : "2vh Arial";
    }
    ctx.fillText(b.text, b.x, b.y, b.width);
  }
}

// check if block is out of frame then shift the array to delete 
// the oldest item
//  param: first @ the first block in the blocks array
function deleteOutOfFrame(first) {
  // depending on the direction of the block, check if it is out of bounds
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

// flip a block in the other direction based on its current direction
function flip(block) {
  switch(block.state) {
    case direction.UP:
      block.state = direction.DOWN;
      break;
    case direction.DOWN:
      block.state = direction.UP;
      break;
    case direction.RIGHT:
      block.state = direction.LEFT;
      break;
    case direction.LEFT:
      block.state = direction.RIGHT;
      break;
  }
}

/***************************** MOVEMENT METHODS *****************************/

// PLAYER MOVEMENT METHOD
//  param: key @ the inputted key code (arrow key or wasd)
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

  // adjust the corner coordinates for the player block
  player.y2 = player.y + player.height;
  player.x2 = player.x + player.width;
}

// get currently pressed key and pass it to action function
window.onkeydown = function(event) {
  var key = event.code;
  action(key);
}


// actions relegated to a seperate function to simulate key presses on mobile
function action(key) {
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

// RANDOM BLOCK MOVEMENT METHOD
//  param: block @ the block to be moved
//  move the blocks based on their direction and speed
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

  // adjust corner coordinates of this block
  block.y2 = block.y + block.height;
  block.x2 = block.x + block.width;
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
  
  // check if x/y values of two blocks match
  var left_right = ((b1.x == b2.x) && (b1.x2 == b2.x2));
  var top_bottom = ((b1.y == b2.y) && (b1.y2 == b2.y2));

  // check for all possible collision cases
  var collision = 
    top && left_right     || 
    bottom && left_right  || 
    left && top_bottom    || 
    right && top_bottom;

  // log collision in the console
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
  console.log("Randomly generated from " + list);
  return generated;
}

// create a random block with speed and direction (velocity)
function randomBlock(speed, state, randomColor = false) {
  // max amount of possible pots for a random block to spawn
  //  should be divisible by BLOCK_SIZE
  var MAX_AMOUNT_X = canvas.width / BLOCK_SIZE;
  var MAX_AMOUNT_Y = canvas.height / BLOCK_SIZE

  // max height for a random block
  var MAX_HEIGHT = canvas.height * height_limiter;

  // get a random within a max amount
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

  if(randomColor || mode == 3 || mode == 4) {
    block.color = pickRandom(colors, 1)[0];
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


/***************************** ITEM METHODS *****************************/

// list of random effects to choose from
//  slow and clear appear twice to make them more common
var effects = ["slow", "slow", "clear", "clear", "life","reverse"];

// RANDOM ITEM CREATION METHOD
//  param: state @ the effect of the item
function randomItem(state) {
  var MAX_X = canvas.width / BLOCK_SIZE;
  var MAX_Y = canvas.height / BLOCK_SIZE;
  var RANDOM_X = Math.floor(Math.random() * MAX_X) * BLOCK_SIZE;
  var RANDOM_Y = Math.floor(Math.random() * MAX_Y) * BLOCK_SIZE;

  // create an item a random x,y  with a specific color based on its state
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
  originalScore = score;  // score at time of consumption
  activeItem = true; // indicates that an item has been consumed

  // item effects
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
        if(blocks[i].color != BLACK) {
          blocks[i].collide = false; // turn of collision for existing blocks
          blocks[i].color = colorMatch(blocks[i].color); // transparent blocks
        }
      }
      activeItem = true;
      bonus++;
      randomLaser(pickRandom(directions, 1)[0]);
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
  
  // this is specifically used to check if a reversal has been used
  if(!playerBlock) {
    lastUsed = block.state;
  }

  items.pop();  // the length of items array will always be 1 so we can just pop it

}


/***************************** RUNS EVERY GAME LOOP *****************************/
// update the state of the board
// check for collisions
// calls updateTick every tick

// update the page with new positions of all blocks
function update() {
  clear();  // clear the board for redrawing
  drawBlock(player); // redraw the player block at updated positions

  // update positions of random blocks and check for collisions
  for(i in blocks) {
    moveRandom(blocks[i]); 
    drawBlock(blocks[i]);

    // if block is able to collide, check if it hits the player
    if(blocks[i].collide && collision(player, blocks[i]) && !ex20) {
      // do not sto pthe game if the player has an extra life
      if(player.state == "life") {
        blocks[i].collide = false;
        blocks[i].color = colorMatch(blocks[i].color);
        player.state = "";
        player.color = BLUE;
        labelBonus.classList.remove("label-bonus");
      } else {
        console.log("Stop");
        stop(); // stop the game if player does not have an extra life
      }
    }
    
    // check if the the block has collided with an item
    if(items.length > 0 && collision(items[0], blocks[i]) && blocks[i].collide) {
      items.pop();
    }
  }

  // check if the player has collided with an item
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

  if(mobile) {
    mobileControls.classList.remove("popup-open");
    mobileControls.classList.add("popup-closed");
  }
}

// game reset
//  initiate the reset transition
function reset() {
  for(i in blocks) {
    if(blocks[i].collide) {
      if(mode < 2) {
        blocks[i].state = direction.DOWN;
      } else if(mode == 4) {
        flip(blocks[i]);
      } 

      if(blocks[i].color == BLACK || blocks[i].color == WHITE || blocks[i].state == "STOPPED") {
        blocks[i].state = direction.DOWN;
      }
    }
    blocks[i].speed = 16; 

    // catch all for any still blocks
    if(!(blocks[i].state in directions)) {
      blocks[i].state = direction.DOWN;
      blocks[i].speed = 32;
    }

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

  setMode();

  STARTING_X = (canvas.width / 2) - (BLOCK_SIZE / 2); // center of the page
  STARTING_Y = (canvas.height / 2) - (BLOCK_SIZE / 2); // center of the page

  // reset all dynamic variables to defaults
  clear_color = default_clear_color;
  player = new Block(STARTING_X, STARTING_Y, BLOCK_SIZE, BLOCK_SIZE, PLAYER_COLOR);
  items = [];
  blocks = [];
  randomSpeed = default_speed;
  randomDirections = [];
  height_limiter = default_height_limiter
  time = 0;
  gap = default_gap;
  score = 0;
  bonus = 0;
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

  screen = false;
  
  console.log("Starting game @ ");
  console.log(" default_speed: " + default_speed);
  console.log(" default_gap: " + default_gap);
  
  overlay.classList.remove("popup-open");
  overlay.classList.add("popup-closed");
  document.body.classList.remove("darken");
  canvas.classList.remove("transparent");

  if(mobile) {
    mobileControls.classList.add("popup-open");
    mobileControls.classList.remove("popup-closed");
  }

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

function startScreen() {
    var item1 = new Block(STARTING_X - 140, STARTING_Y + 40, BLOCK_SIZE, BLOCK_SIZE, DARK_BLUE);
    var item2 = new Block(STARTING_X - 140, STARTING_Y + 40*2, BLOCK_SIZE, BLOCK_SIZE, LIME);
    var item3 = new Block(STARTING_X - 140, STARTING_Y + 40*3, BLOCK_SIZE, BLOCK_SIZE, YELLOW)
    var item4 = new Block(STARTING_X - 140, STARTING_Y + 40*4, BLOCK_SIZE, BLOCK_SIZE, GRAY);
    var item5 = new Block(STARTING_X - 140, STARTING_Y + 40*5, BLOCK_SIZE, BLOCK_SIZE, PINKISH);

    var text1 = new Block(STARTING_X - 60, STARTING_Y + 56, 800, BLOCK_SIZE, DARK_BLUE);
    var text2 = new Block(STARTING_X - 60, STARTING_Y + 96, 800, BLOCK_SIZE, LIME);
    var text3 = new Block(STARTING_X - 60, STARTING_Y + 136, 800, BLOCK_SIZE, YELLOW)
    var text4 = new Block(STARTING_X - 60, STARTING_Y + 176, 800, BLOCK_SIZE, GRAY);
    var text5 = new Block(STARTING_X - 60, STARTING_Y + 216, 800, BLOCK_SIZE, PINKISH);

    text1.text = "slows down blocks for a short time";
    text2.text = "existing blocks become transparent";
    text3.text = "extra life, doesn't stack";
    text4.text = "reversal"
    text5.text = "bonus, sometimes gives you extra life"
    

    blocks = [item1, item2, item3, item4, item5, text1, text2, text3, text4, text5]
    for(i in blocks) {
      blocks[i].state = direction.DOWN;
      drawBlock(blocks[i]);
    }
}

colorPicker.onchange = function(event) {
  PLAYER_COLOR = colorPicker.value;
  player.color = PLAYER_COLOR;
  drawBlock(player);
}