/***************************** EVENTS FOR MAX MODE *****************************/


// for a special mode
function maxMode() {
  var level_1 = tick;
  var level_2 = tick * 2;
  var level_3 = tick * 3;
  var level_4 = tick * 4;
  var level_5 = tick * 5;
  var level_8 = tick * 8;


  if(score >= 0 && score < level_3)
    dark(1);
  
  if(score == halftick) {
    var textBlock = new Block(canvas.width / 2 - 60, 0, 800, 80, WHITE);
    textBlock.state = direction.DOWN;
    textBlock.text = 'ready?';
    textBlock.speed = 5;
    textBlock.collide = false;
    blocks.push(textBlock);
    freeLife();
  }
  

  if(score >= level_1 && score < level_4) {
    if(score % tick == 0) {
      randomDirections = pickRandom(directions, 3);
      //randomSpeed++;
    }
    reversal(level_2);
    randomThree();
  }

  if(score >= level_4 && score < level_8) {
    if(score == level_4) {
      randomDirections = pickRandom(directions, 3);
      randomSpeed++;
    }
    reversal(level_5);
    randomThree();
  }

  infinite(level_8);
}