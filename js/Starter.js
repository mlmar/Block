/***************************** Game starter *****************************/


// settings functions
function settings(force = false) {
  if(!force) {
    overlaySettings.classList.toggle("popup-open");
    overlaySettings.classList.toggle("popup-closed");
  } else {
    overlaySettings.classList.remove("popup-open");
    overlaySettings.classList.add("popup-closed");
  }
}

slider.onchange = function(event) {
  difficulty = parseFloat(slider.value);
  labelDif.innerText = "Difficulty: " + difficulties[difficulty];
  console.log(difficulty);
}


// multiplier = num score between each level, cannot be lower than 20
function setLevelTick(n) {
  tick = n >= 20 ? n : 20;
  halftick = n / 2;
  for(i = 0; i < MAX_LEVEL_AMOUNT; i++) {
    levels[i] = i * n;
  }
  console.log(levels);
}

function setDifficulty() {
  switch(difficulty) {
    case 0:
      default_speed = 3; // defaults
      default_gap = 32; // defaults
      default_height_limiter = .8;
      canvas.width = 500;
      break;
    case 1:
      default_speed = 5;
      default_gap = 29;
      default_height_limiter = .8;
      canvas.widdth = 500;
      break;
    case 2:
      default_speed = 6;
      default_gap = 26;
      default_height_limiter = .8;
      canvas.width = 500;
      break;
    case 3:
      default_speed = 6;
      default_gap = 20;
      default_height_limiter = .8;
      canvas.width = 500;
      break;
    case 4:
      default_speed = 8;
      default_gap = 16;
      default_height_limiter = .8;
      canvas.width = 820;
  }
}



var text = "";
disclaimer.innerText = general;
for(i = 0; i < scoreList.length; i++) {
   text += scoreList[i] + "\n";
}
list.innerText = text;


// DEFAULT STARTER CODE: LEVEL TICK LOWER THAN 20 WILL BREAK THE GAME
resetValues();
setLevelTick(20);