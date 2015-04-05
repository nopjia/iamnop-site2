(function() {

"use strict";

console.log("Hello! My name is Nop!");


// FUNCTIONS

function toHex(x) {
  return ("0" + parseInt(x).toString(16)).slice(-2);
}
function rgbToHex(rgb) {
  if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  return "#" + toHex(rgb[1]) + toHex(rgb[2]) + toHex(rgb[3]);
}


// RENDERING

var canvas = document.getElementById("canvas");
var renderer = new RenderContext(canvas);

var update = function() {
  renderer.update();
  requestAnimationFrame(update);
};


// SET COLOR SCHEME

var setScheme = (function() {
  var prevElem;
  return function setScheme() {
    if (this === prevElem)
      return;

    document.body.className = this.dataset.palette || "";
    this.classList.add("selected");

    if (prevElem)
      prevElem.classList.remove("selected");
    prevElem = this;

    // extract scheme colors for renderer
    var bgcolor = rgbToHex(window.getComputedStyle(document.body).getPropertyValue("background-color"));
    var color = rgbToHex(window.getComputedStyle(document.body).getPropertyValue("color"));
    renderer.setColors(color, bgcolor);
    console.log("Scheme: " + color + "," + bgcolor);
  };
})();

// bind setScheme to onclick
Array.prototype.forEach.call(document.querySelector(".scheme-palette").children, function(elem) {
  elem.onclick = setScheme;
});

// init setScheme
setScheme.call(document.querySelector(".scheme-palette .selected"));


// START
update();


})(); // global closure