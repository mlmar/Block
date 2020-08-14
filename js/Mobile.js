/** mobile control listeners ***/
var esc = document.getElementById("esc");
var btnClose = document.getElementById("btnClose");

var btnUp = document.getElementById("btnUp");
var btnLeft = document.getElementById("btnLeft");
var btnRight = document.getElementById("btnRight");
var btnDown = document.getElementById("btnDown");


var listener = "touchend";

function addButtons() {
  /** assign play and settings buttons for mobile **/


  esc.addEventListener(listener, function() {
    action(ESCAPE);
  });

  btnClose.addEventListener(listener, function() {
    action(ESCAPE);
  });

  canvas.addEventListener(listener, function() {
    action(SPACE);
    console.log("Tapped to play")
  });


  btnUp.addEventListener(listener, function() { action(direction.UP); } );
  btnLeft.addEventListener(listener, function() { action(direction.LEFT); } );
  btnRight.addEventListener(listener, function() { action(direction.RIGHT); } );
  btnDown.addEventListener(listener, function() { action(direction.DOWN); } );


  btnUp.addEventListener("click", function(e) { e.preventDefault() } );
  btnLeft.addEventListener("click", function(e) { e.preventDefault() } );
  btnRight.addEventListener("click", function(e) { e.preventDefault() } );
  btnDown.addEventListener("click", function(e) { e.preventDefault() } );

  divMode.addEventListener(listener, function() { setModeText() });
}



/** change label text and font size just for mobile **/

if(mobile) {
  labelOverlay.innerText = "tap to play";
  esc.innerText = "gamemode settings"
  addButtons();
}


/** show add baner if app already installed **/
// https://stackoverflow.com/questions/50543163/can-i-detect-if-my-pwa-is-launched-as-an-app-or-visited-as-a-website
const mobileIos = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test( userAgent );
}

var banner = document.getElementById("banner");
if (mobileIos && "standalone" in window.navigator && !window.navigator.standalone) {
  console.log("displaying banner");
  banner.classList.add("popup-open");
  banner.classList.remove("popup-closed");
  listener = "none";
} else {
  console.log("hiding banner");
  banner.classList.remove("popup-open");
  banner.classList.add("popup-closed");
  listener = "touchend";
}