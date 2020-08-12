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
  mode = parseFloat(slider.value);
  labelDif.innerText = "mode: " + modes[mode];
  if(mode == 0) {
    labelDif.style.color = WHITE;
  } else {
    labelDif.style.color = colors[mode - 1];
  }
  console.log(mode);
}


// multiplier = num score between each level, cannot be lower than 20
function setLevelTick(n) {
  tick = n >= 20 ? n : 20;
  halftick = n / 2;
}

function setMode() {
  switch(mode) {
    case 0:
      default_speed = 3; // defaults
      default_gap = 32; // defaults
      default_height_limiter = .8;
      canvas.width = 500;
      break;
    case 1:
      default_speed = 4;
      default_gap = 32;
      default_height_limiter = .6;
      canvas.width = 500;
      break;
    case 2:
      default_speed = 7;
      default_gap = 26;
      default_height_limiter = .8;
      canvas.width = 500;
      break;
    case 3:
      default_speed = 8;
      default_gap = 20;
      default_height_limiter = .8;
      canvas.width = 500;
      break;
    case 4:
      default_speed = 9;
      default_gap = 17;
      default_height_limiter = .8;
      if(!mobile)
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
startScreen();