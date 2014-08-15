var PIXI = require("pixi.js");

module.exports = function loadTexture (subpath) {
  return PIXI.Texture.fromImage("/assets/img/game/"+subpath);
};
