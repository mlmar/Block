function endurance() {
  var half = score % halftick == 0;
  var quarter = score % (halftick / 2) == 0;

  // single direction and target player for 4 levels
  if(score >= 0 && score < tick * 4) {
    fourSingle(0, false); // START AT 0: level 1-4

    if(score > 0 && quarter)
      targetConsecutive(0);
  }

  // target items
  if(score >= tick * 4) {
    if(items.length > 0 && quarter)
      targetLaser(randomDirections[0], items[0]);
  }

  // two directions with lasers for levels 4-8
  if(score >= tick * 4 && score < tick * 8) {
    fourDouble(tick * 4, true) // level 5-8
  }

  if(score == tick * 8) {
    freeLife();
    gap++;
  }

  if(score >= tick * 8) {
    infiniteEndurance(tick * 8);
  }

  // free bonus  every level and free life every 4 levels after level 8
  if(score % tick == 0 && score > tick * 8) {
    bonus++;
    if(score % (tick * 4) == 0) {
      freeLife();
    }
  }

  enduranceSpeedHandler();
}

function infiniteEndurance(level_n) {
  if(score == level_n)
    referencePoint = score;

  if(score >= level_n) {
    if(score == referencePoint + tick * 10) {
      referencePoint = score;
      randomSpeed++;
    }

    generateEnduranceLoop(referencePoint);
  }
}

function generateEnduranceLoop(level_n) {
  var half = score % halftick == 0;
  var quarter = score % (halftick / 2) == 0;

  level_b = level_n + tick * 2;
  level_h = level_n + tick * 8;
  level_i = level_n + tick * 9;
  level_j = level_n + tick * 10

    // clutter from elvel 8 to 10
  if(score >= level_n && score < level_b) {
    clutter();

    if(quarter)
      randomLaser(randomDirections[0]);
  }

  if(score >= level_b && score <= level_h) {
    walls(level_n + tick * 2);
  }

  if(score > level_h && score < level_i) {
    topLeftCorner(level_h, true)

    if(quarter)
      randomLaser(randomDirections[0]);
  }

  if(score >= level_i && score < level_j) {
    bottomRightCorner(level_i, false);

    if(quarter)
      randomLaser(randomDirections[0]);
  }
}



//target the player with two lasers for 4 conecutive levels
function targetConsecutive(level_n) {
  if(score >= level_n && score <= level_n + tick) {
    targetLaser(direction.LEFT, player);
    targetLaser(direction.DOWN, player);
  }
  if(score >= level_n + tick && score <= level_n + tick * 2) {
    targetLaser(direction.UP, player);
    targetLaser(direction.RIGHT, player);
  }
  if(score >= level_n + tick * 2 && score <= level_n + tick * 3) {
    targetLaser(direction.UP, player);
    targetLaser(direction.RIGHT, player);
  }
  if(score >= level_n + tick * 3 && score <= level_n + tick * 4) {
    targetLaser(direction.LEFT, player);
    targetLaser(direction.DOWN, player);
  }
}


//set up black walls taking 60 percent of the screen then make blocks come from the bottom then top
function walls(level_n) {
  
  // place the walls and choose the first direction (up/down) to shoot the player
  if(score == level_n) {
    randomDirections = pickRandom([direction.UP,direction.DOWN], 2);
    wallSpeed = canvas.height / BLOCK_SIZE * .1;

    for(i = 0; i < canvas.width / BLOCK_SIZE * .3; i++) {
      var block = new Block(i * BLOCK_SIZE, 0-canvas.height*2, BLOCK_SIZE, canvas.height * 2, BLACK);
      block.state = direction.DOWN;
      block.speed = wallSpeed;
      block.color = mobile ? WHITE : BLACK;
      blocks.push(block);

      var block2 = new Block(canvas.width - BLOCK_SIZE - i * BLOCK_SIZE, canvas.height, BLOCK_SIZE, canvas.height * 2, BLACK);
      block2.state = direction.UP;
      block2.speed = wallSpeed;
      block2.color = mobile ? WHITE : BLACK;
      blocks.push(block2);
    }
  }
  
  // move the blocks into place
  if(score >= level_n && score < level_n + tick) {
    for(i in blocks) {
      if(blocks[i].color == BLACK || blocks[i].color == WHITE) {
        if(blocks[i].state == direction.DOWN && blocks[i].y2 > canvas.height) {
          blocks[i].state = "STOPPED";
        } else if(blocks[i].state == direction.UP && blocks[i].y < 0) {
          blocks[i].state = "STOPPED";
        }
      }
    }
  }

  // up for 4 levels
  if(score >= level_n + tick - halftick && score < level_n + tick * 3) {
    verticalBlocks(randomDirections[0]);


    if(score % 2 == 0) {
      targetLaser(randomDirections[0], player)
    }
  }

  // down for 4 levels
  if(score >= level_n + tick * 3 && score < level_n + tick * 6) {
    verticalBlocks(randomDirections[1]);

    if(score % 2 == 0) {
      targetLaser(randomDirections[1], player)
    }
  }

  // at the 8th level from level_n, get rid of the black blocks
  if(score == level_n + tick * 6) {
    console.log("Getting rid of the black bars");
    for(i in blocks) {
      if(blocks[i].color == BLACK || blocks[i].color == WHITE) {
        if(blocks[i].x <= canvas.width * .3) {
          blocks[i].state = direction.LEFT;
        } else  {
          blocks[i].state = direction.RIGHT;
        }
        blocks[i].speed = 2;
      }
    }
  }
}

// only send blocks vertically within wall boundaries
function verticalBlocks(state) {
  var MAX_AMOUNT_X = Math.floor(canvas.width / BLOCK_SIZE * .7);
  var MIN_AMOUNT_X  = Math.floor(canvas.width / BLOCK_SIZE * .3);
  var MAX_HEIGHT = canvas.height * .2;

  var RANDOM_X = Math.floor(Math.random() * (MAX_AMOUNT_X - MIN_AMOUNT_X + 1 ) + MIN_AMOUNT_X) * BLOCK_SIZE;
  var RANDOM_HEIGHT = Math.floor((Math.random() * MAX_HEIGHT) + canvas.height * .1);

  var block;
  
  switch(state) {
    case direction.UP: // blocks generate below the screen
      block = new Block(RANDOM_X, canvas.height + RANDOM_HEIGHT, BLOCK_SIZE, RANDOM_HEIGHT, AQUA);
      break;
    case direction.DOWN: // blocks generate above the screen
      block = new Block(RANDOM_X, 0 - RANDOM_HEIGHT, BLOCK_SIZE, RANDOM_HEIGHT, PINK);
      break;
  }

  block.color = pickRandom(colors, 1)[0];
  block.speed = randomSpeed;
  block.state = state;

  blocks.push(block);
}

function enduranceSpeedHandler() {
  if(score % (tick * 4) == 0 && score >= tick * 8 && score <= tick * 16)  {
    gap--;
  }

//   if(score % tick == 0 && score >= tick * 4 && height_limiter >= .4) {
//     height_limiter -= .1;
//   }
}


// unused to thin the canvas width, buggy on mobile
// used walls() instead
function thin() {
  canvas.width--;

  player.x = canvas.width / 2 - BLOCK_SIZE / 2;
  player.y = canvas.width / 2 - BLOCK_SIZE / 2;

  if(canvas.width > 180)
    window.requestAnimationFrame(thin);
}