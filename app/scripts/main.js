"use strict";

console.log("Hello! My name is Nop!");

document.querySelector(".scheme-palette").onclick = function(e) {
  var scheme = e.target.classList[0];
  document.body.className = scheme || "";
};