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


btnUp.addEventListener("touchstart", function() { action(direction.UP); } );
btnLeft.addEventListener("touchstart", function() { action(direction.LEFT); } );
btnRight.addEventListener("touchstart", function() { action(direction.RIGHT); } );
btnDown.addEventListener("touchstart", function() { action(direction.DOWN); } );


// btnUp.addEventListener("click", function(e) { e.preventDefault() } );
// btnLeft.addEventListener("click", function(e) { e.preventDefault() } );
// btnRight.addEventListener("click", function(e) { e.preventDefault() } );
// btnDown.addEventListener("click", function(e) { e.preventDefault() } );