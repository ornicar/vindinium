var PIXI = require("pixi.js");

var beerTexture = PIXI.Texture.fromImage("/assets/img/beer2.png");

function Tavern () {
  PIXI.Sprite.call(this, beerTexture);
  this.position.x = 4;
  this.position.y = -8;
}
Tavern.prototype = Object.create(PIXI.Sprite.prototype);
Tavern.prototype.constructor = Tavern;

module.exports = Tavern;

