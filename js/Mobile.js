var btnSettings = document.getElementById("btnSettings");
btnSettings.ontouchstart = function(event) {
  action(ESCAPE)
}

var btnStart = document.getElementById("btnStart");
btnStart.ontouchstart = function(event) {
  action(SPACE);
}


var btnUp = document.getElementById("btnUp");
var btnLeft = document.getElementById("btnLeft");
var btnRight = document.getElementById("btnRight");
var btnDown = document.getElementById("btnDown");


checkBox.onchange = function(event) {
  if(checkBox.checked) {
    listener = "touchstart"
    console.log("touchstart");
  } else {
    listener = "touchend"
    console.log("touchend")
  }
}

listener = "touchend";

btnUp.addEventListener(listener, function() { action(direction.UP); } );
btnLeft.addEventListener(listener, function() { action(direction.LEFT); } );
btnRight.addEventListener(listener, function() { action(direction.RIGHT); } );
btnDown.addEventListener(listener, function() { action(direction.DOWN); } );


btnUp.addEventListener("click", function(e) { e.preventDefault() } );
btnLeft.addEventListener("click", function(e) { e.preventDefault() } );
btnRight.addEventListener("click", function(e) { e.preventDefault() } );
btnDown.addEventListener("click", function(e) { e.preventDefault() } );