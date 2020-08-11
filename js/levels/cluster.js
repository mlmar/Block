/***************************** DIAGONAL MODE *****************************/
// not actually diagonal
// preprogrammed levels 1-8

var randomWaves = [topLeftCorner, topRightCorner, bottomLeftCorner, bottomRightCorner];
var waves;
var waveBooleans = []

var randomLaserDirections = []

function cluster() {
  var level_1 = tick;
  var level_2 = tick * 2;
  var level_3 = tick * 3;
  var level_4 = tick * 4;
  var level_5 = tick * 5;
  var level_6 = tick * 6;
  var level_7 = tick * 7;
  var level_8 = tick * 8;
  var level_9 = tick * 9;
  var level_10 = tick * 10;

  // custom speed and gap handler
  if(score % (tick * 6) == 0 && score > 0) {
    console.log("Increasing gap")
    randomSpeed++;
  }

  // get random variables every halftick
  if(score % halftick == 0) {
    if(score >= level_2) {
      waveBooleans[0] = pickRandom([true, false], 1)[0];
      waveBooleans[1] = pickRandom([true, false], 1)[0];
    }

    randomDirections = pickRandom(directions, 3); // random directions for the random blocks
    randomLaserDirections = pickRandom(directions, 4); // random directions for the lasers
  }
  
  if(score % tick == 0 && score >= level_2) {
    waves = pickRandom(randomWaves, 2); // choose 2 random waves every tick
  }


  // level 1-2: 3 directions at once changing every halftick
  if(score >= 0 && score < level_2) {
    randomThree();
  }

  // preprogrammed lasers to shoto every halftick in levels 2-3
  if(score >= level_2 && score < level_3) {
    laserGradualGrid(level_2);
    randomBlock(randomSpeed, randomDirections[0]);
    randomBlock(randomSpeed, randomDirections[1]);
  }

  // level 3-5 do some waves
  if(score > level_3 && score <= level_5) {
    waves[0](tick * (level - 2), waveBooleans[0]);
    if(score >= level_4) {
      waves[1](tick * (level - 2), waveBooleans[1]);
    }
  }

  // level 5-7 show off the lasers
  if(score >= level_5 && score < level_7) {
    randomBlock(randomSpeed, randomDirections[0]);
    randomBlock(randomSpeed, randomDirections[1]);
    if(score % 4 == 0) {
      randomLaser(randomLaserDirections[0]);
      randomLaser(randomLaserDirections[1]);
      randomLaser(randomLaserDirections[2]);
      randomLaser(randomLaserDirections[3]);
    }
  }

  // more waves
  if(score > level_7 && score < level_8) {
    waves[0](tick * (level - 2), waveBooleans[0]);
    waves[1](tick * (level - 2), waveBooleans[1]);
  }
  

  // start infinite cluster loop
  if(score >= level_8) {
    if(score <= level_9)
      dark(level_8);

    if(score == level_8 + halftick)
      funWords();

    infiniteCluster(level_9);
  }

  // free life every other level
  if(score % (tick * 2) == 0 && score >= level_8) {
    freeLife();
  }
}

function funWords() {
  var textBlock = new Block(canvas.width, 220, 2000, 60, WHITE);
  textBlock.state = direction.LEFT;
  textBlock.text = 'free life every other level';
  textBlock.speed = 7;
  textBlock.collide = false;

  blocks.push(textBlock)
}

// used to initiate a loop for this gamemode
function infiniteCluster(level_n) {
  if(score == level_n)
    referencePoint = score;

  if(score >= level_n) {
    if(score == referencePoint + tick * 4)
      referencePoint = score;

    generateClusterLoop(referencePoint);
  }
}

// actual gamemode loop for after levels 8
function generateClusterLoop(level_n) {
  var level_a = level_n + tick; 
  var level_b = level_n + tick * 2;
  var level_c = level_n + tick * 3; 
  var level_d = level_n + tick * 4;
  
  if(score == level_n) {
    console.log("Starting looped segment @ " + level_n);
    randomSpeed += 1;
    height_limiter = .3;
  }

  if(score >= level_n && score < level_a) {
    if(score % 2 == 0) { 
      randomLaser(direction.UP);
      randomLaser(direction.UP);
      randomLaser(direction.DOWN);
      randomLaser(direction.DOWN);
      randomLaser(direction.LEFT);
      randomLaser(direction.LEFT);
      randomLaser(direction.RIGHT);
      randomLaser(direction.RIGHT);
      randomLaser(randomLaserDirections[0]);
      randomLaser(randomLaserDirections[1]);
      randomLaser(randomLaserDirections[2]);
    }
  }

  if(score == level_a)
    randomSpeed -= 1;
  
  if(score >= level_a && score < level_b) {
    clutter();
    if(level_a % (halftick / 2) == 0)
      randomLaser(randomLaserDirections[0]);
  }

  if(score > level_b && score <= level_c - halftick) {
    waves[0](tick * (level - 2), waveBooleans[0]);
  }

  if(score >= level_c - halftick && score < level_c) {
    clutter();
    if(score % halftick == 0) {
      randomLaser(direction.UP);
      randomLaser(direction.DOWN);
      randomLaser(direction.LEFT);
      randomLaser(direction.RIGHT);

    }
  }

  if(score > level_c && score < level_d) {
    clutter();
    if(level_a % (halftick / 2) == 0) {
      randomLaser(randomLaserDirections[0]);
    }
  }

  if(score == level_d - 1)
    console.log("Ending looped segment @ " + level_n);
}



// build up to a grid of lasers throughout a level every halftick
function laserGradualGrid(level_n) {
  if(score >= (level_n) && score % (halftick / 2)== 0) {
    randomLaser(direction.UP);
    randomLaser(direction.UP);
    randomLaser(direction.UP);
  }

  if(score >= (level_n + halftick / 2) && score % (halftick / 2) == 0) {
    randomLaser(direction.DOWN);
    randomLaser(direction.DOWN);
    randomLaser(direction.DOWN);
  }

  if(score >= (level_n + halftick) && score % (halftick / 2) == 0) {
    randomLaser(direction.LEFT);
    randomLaser(direction.LEFT);
    randomLaser(direction.LEFT);
  }

  if(score >= (level_n + tick - halftick / 2) && score % (halftick / 2) == 0) {
    randomLaser(direction.RIGHT);
    randomLaser(direction.RIGHT);
    randomLaser(direction.RIGHT);
  }
}

/***************************** WAVES *****************************/


// level_n indcates a starting level for each wave since these methods
//  rely on the score
// ASCEND/DESCEND indicates if the blocks are rippling inward

function topLeftCorner(level_n, descend) {
  if(descend) {
    upDownWave(level_n, direction.DOWN, GREEN, direction.RIGHT);
    leftRightWave(level_n, direction.RIGHT, PINK, direction.DOWN);
  } else {
      upDownWave(level_n, direction.UP, PINK, direction.RIGHT);
    leftRightWave(level_n, direction.LEFT, ORANGE, direction.DOWN);
  }
}


function topRightCorner(level_n, descend) {
  if(descend) {
    upDownWave(level_n, direction.DOWN, ORANGE, direction.LEFT);
    leftRightWave(level_n, direction.LEFT, GREEN, direction.DOWN);
  } else {
    upDownWave(level_n, direction.UP, PINK, direction.LEFT);
    leftRightWave(level_n, direction.RIGHT, GREEN, direction.DOWN);
  }
}


function bottomLeftCorner(level_n, ascend) {
  if(ascend) {
    upDownWave(level_n, direction.UP, GREEN, direction.RIGHT);
    leftRightWave(level_n, direction.RIGHT, AQUA, direction.UP);
  } else {
    upDownWave(level_n, direction.DOWN, AQUA, direction.RIGHT);
    leftRightWave(level_n, direction.LEFT, ORANGE, direction.UP);
  }
}

function bottomRightCorner(level_n, ascend) {
  if(ascend) {
    upDownWave(level_n, direction.UP, ORANGE, direction.LEFT);
    leftRightWave(level_n, direction.LEFT, AQUA, direction.UP);
  } else {
    upDownWave(level_n, direction.DOWN, AQUA, direction.LEFT);
    leftRightWave(level_n, direction.RIGHT, PINK, direction.UP);
  }
}



// creates a wave coming from top or bottom x axis
function upDownWave(level_n, blockDirection, color, waveDirection) {
  var height = canvas.height;
  var DOUBLE_SIZE = BLOCK_SIZE * 2;

  // every other position along x axis starting at the left or right y axis 
  var x = (waveDirection == direction.RIGHT) ? (score - level_n) * DOUBLE_SIZE - DOUBLE_SIZE : (canvas.width - (score - level_n) * DOUBLE_SIZE + BLOCK_SIZE);
  var y = (blockDirection == direction.DOWN) ? (0 - height) : canvas.height;

  var block = new Block(x, y, BLOCK_SIZE, height, color);
  block.speed = randomSpeed * 1.5;
  block.state = blockDirection;
  blocks.push(block);
}




// creates a wave coming from the left or right y axis
function leftRightWave(level_n, blockDirection, color, waveDirection) {
  var width = canvas.width;
  var DOUBLE_SIZE = BLOCK_SIZE * 2;

  // every other position along y axis starting at the bottom or top x axis
  var x = (blockDirection == direction.LEFT) ? (canvas.width) : (0 - width);
  var y = (waveDirection == direction.DOWN) ? (score - level_n) * DOUBLE_SIZE - DOUBLE_SIZE : (canvas.height - (score - level_n) * DOUBLE_SIZE + BLOCK_SIZE);

  var block = new Block(x, y, width, BLOCK_SIZE, color);
  block.speed = randomSpeed * 1.5;
  block.state = blockDirection;
  blocks.push(block);
}