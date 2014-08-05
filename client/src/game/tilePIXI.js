var PIXI = require("pixi.js");

module.exports = function tilePIXI (size) {
  return function (baseTexture, x, y) {
    return new PIXI.Texture(baseTexture, { x: x * size, y: y * size, width: size, height: size });
  };
};
