function diagonal() {
  var level_1 = tick;
  var level_2 = tick * 2;
  var level_3 = tick * 3;
  var level_4 = tick * 4;
  var level_5 = tick * 5;
  var level_8 = tick * 8;

  if(score >= 0 && score < level_1) {
    topLeft(score);
  }
}

function topLeft(level_n) {
  var pos = Math.floor((canvas.width / level_n);
  var half = canvas.height / 2;

  var blockTop = new Block(pos, 0 - half, BLOCK_SIZE, half, PINK);
  blockTop.speed = randomSpeed;
  blockTop.state = direction.DOWN;
  blocks.push(blockTop);
  
  var blockSide = new Block(0 - half, pos, half, BLOCK_SIZE, PINK);
  blockSide.speed = randomSpeed;
  blockSide.state = direction.DOWN;
  blocks.push(blockSide);
}


function topRight(level_n) {
  var pos = Math.floor((score - level_n) * 40);
  var half = canvas.height / 2;

  var blockTop = new Block(pos, 0 - half, BLOCK_SIZE, half, PINK);
  blockTop.speed = randomSpeed;
  blockTop.state = direction.DOWN;
  blocks.push(blockTop);
  
  var blockSide = new Block(0 - half, pos, half, BLOCK_SIZE, PINK);
  blockSide.speed = randomSpeed;
  blockSide.state = direction.DOWN;
  blocks.push(blockSide);
}