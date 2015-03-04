"use strict";

console.log("Hello! My name is Nop!");

Array.prototype.forEach.call(document.querySelector(".scheme-palette").children, function(elem) {
  elem.onclick = function(e) {
    var scheme = elem.classList[0];
    document.body.className = scheme || "";
  };
});