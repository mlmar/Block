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

function setModeText() {
  mode = (mode < modes.length - 1) ? mode + 1 : 0;
  labelMode.innerText = "gamemode: " + modes[mode];

  if(mode == 0) {
    labelMode.style.color = WHITE;
  } else {
    labelMode.style.color = colors[mode - 1];

  }
  console.log(mode);
}

if(!mobile) {
  divMode.onclick = function(event) {
    setModeText();
  }
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
      default_speed = 7;
      default_gap = 26;
      default_height_limiter = .8;
      canvas.width = 500;
      break;
    case 2:
      default_speed = 3;
      default_gap = 28;
      default_height_limiter = .8;
      canvas.width = 500;
      break;
    case 3:
      default_speed = 4;
      default_gap = 32;
      default_height_limiter = .6;
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


// input correct text to settings
var text = "";
disclaimer.innerText = general;
for(i = 0; i < scoreList.length; i++) {
   text += scoreList[i] + "\n";
}
list.innerText = text;
document.getElementById("labelVersion").innerText = version;


// DEFAULT STARTER CODE: LEVEL TICK LOWER THAN 20 WILL BREAK THE GAME

resetValues();
setLevelTick(20);
startScreen();