/***************************** TRANSITIONS FOR ORIGINAL MODE *****************************/
// transitions used from levels 8-10

// Transition to dark mode from level 8 to 9
function levelTransition() {
  // level 9 generates blocks from all four directions
  var level_9 = tick * 8; // direct levels can be written like so
  var level_10 = tick * 9;
  
  // ease up by slowing down the speed
  if(score == level_9)
    randomSpeed--;

  if(score >= level_9 && score < level_10)
    clutter()

  if(score >= level_10) {
    dark(level_10);
    precursor();
  }
}

// another transition
function precursor() {
  var level_11 = tick * 10;

  // show words a halftick before moving onto infintie generaiton
  var blockThreshold = level_11 - tick * .6;
  if(score == blockThreshold) {
    var textBlock = new Block(canvas.width, canvas.height/2, 800, 80, WHITE);
    textBlock.state = direction.LEFT;
    textBlock.text = 'hey. thanks for playing, good luck.';
    textBlock.speed = 5;
    textBlock.collide = false;
    blocks.push(textBlock);
  }

  // lower number of pieces but faster speed
  if(score == level_11) {
    gap = 44;
    randomSpeed += 10;
  }
}