(function() {

"use strict";

console.log("Hello! My name is Nop!");

var setScheme = (function() {
  var prevElem;
  return function setScheme() {
    if (this === prevElem) return;
    document.body.className = this.dataset.palette || "";
    this.className = "selected";
    if (prevElem) prevElem.className = "";
    prevElem = this;
  };
})();

setScheme.call(document.querySelector(".scheme-palette .selected"));

Array.prototype.forEach.call(document.querySelector(".scheme-palette").children, function(elem) {
  elem.onclick = setScheme;
});

})(); // global closure