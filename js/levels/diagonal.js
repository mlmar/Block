function diagonal() {
  var level_1 = tick;
  var level_2 = tick * 2;
  var level_3 = tick * 3;
  var level_4 = tick * 4;
  var level_5 = tick * 5;
  var level_8 = tick * 8;


  alert("not yet");
  stop();

  if(score >= 0 && score < level_1) {
    topRight(0);
  }


}

function topRight(level_n) {
  var pos = Math.floor(canvas.width - score * 40);
  var half = canvas.height *  1.25;

  var blockTop = new Block(pos, 0 - half, BLOCK_SIZE, half, PINK);
  blockTop.speed = randomSpeed;
  blockTop.state = direction.DOWN;
  blocks.push(blockTop);

  var blockTop2 = new Block(pos + canvas.width, 0 - half, BLOCK_SIZE, half, PINK);
  blockTop2.speed = randomSpeed;
  blockTop2.state = direction.DOWN;
  blocks.push(blockTop2);
  
  var blockSide = new Block(canvas.width + half, pos, half, BLOCK_SIZE, GREEN);
  blockSide.speed = randomSpeed;
  blockSide.state = direction.LEFT;
  blocks.push(blockSide);
}