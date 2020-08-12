var btnSettings = document.getElementById("btnSettings");
btnSettings.ontouchend = function(event) {
  action(ESCAPE)
}

var btnStart = document.getElementById("btnStart");
btnStart.ontouchend = function(event) {
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



// using fastclick.js library to bypass 300ms click delay in safari standalone 
if ('addEventListener' in document) {
  document.addEventListener('DOMContentLoaded', function() {
    FastClick.attach(document.body);
  }, false);
}