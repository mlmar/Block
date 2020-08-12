var btnSettings = document.getElementById("btnSettings");
btnSettings.ontouchend = function(event) {
  settings();
}

var btnStart = document.getElementById("btnStart");
btnStart.ontouchstart = function(event) {
  reset();
}

var btnUp = document.getElementById("btnUp");
btnUp.ontouchstart = function(event) {
  action(direction.UP);
}

var btnDown = document.getElementById("btnDown");
btnDown.ontouchstart = function(event) {
  action(direction.DOWN);
}

var btnLeft = document.getElementById("btnLeft");
btnLeft.ontouchstart = function(event) {
  action(direction.LEFT);
}

btnRight = document.getElementById("btnRight");
btnRight.ontouchstart = function(event) {
  action(direction.RIGHT);
}