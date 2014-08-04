var PIXI = require("pixi.js");

var tileSize = 24;

var heroTextures = [
  PIXI.Texture.fromImage("/assets/img/fireheart/player1_life.png"),
  PIXI.Texture.fromImage("/assets/img/fireheart/player2_life.png"),
  PIXI.Texture.fromImage("/assets/img/fireheart/player3_life.png"),
  PIXI.Texture.fromImage("/assets/img/fireheart/player4_life.png")
];

function Hero (obj) {
  PIXI.Sprite.call(this, heroTextures[obj.id - 1]);
  this.updateHero(obj);
}

Hero.prototype = Object.create(PIXI.Sprite.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.updateHero = function (obj) {
  this.id = obj.id;
  this.position.x = obj.pos.x * tileSize;
  this.position.y = obj.pos.y * tileSize - 8;
};

Hero.prototype.getTexture = function () {
  return heroTextures[this.id - 1];
};

module.exports = Hero;
