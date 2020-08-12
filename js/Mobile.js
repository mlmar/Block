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

var btnRight = document.getElementById("btnRight");
btnRight.ontouchstart = function(event) {
  action(direction.RIGHT);
}

btnUp.onclick = function(event) { event.preventDefault() }
btnDown.onclick = function(event) { event.preventDefault() }
btnLeft.onclick = function(event) { event.preventDefault() }
btnRight.onclick = function(event) { event.preventDefault() }