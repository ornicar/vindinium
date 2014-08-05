var PIXI = require("pixi.js");
var smoothstep = require("smoothstep");

function mix (a, b, p) {
  return a + (b-a) * p;
}

var tileSize = 24;

var heroTextures = [
  PIXI.Texture.fromImage("/assets/img/fireheart/player1_life.png"),
  PIXI.Texture.fromImage("/assets/img/fireheart/player2_life.png"),
  PIXI.Texture.fromImage("/assets/img/fireheart/player3_life.png"),
  PIXI.Texture.fromImage("/assets/img/fireheart/player4_life.png")
];

function manhattan (a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function interpolatePosition (a, b, p) {
  return {
    x: mix(a.x, b.x, p),
    y: mix(a.y, b.y, p)
  };
}

function Hero (obj) {
  PIXI.Sprite.call(this, heroTextures[obj.id - 1]);
  this.updateHero(obj);
}

Hero.prototype = Object.create(PIXI.Sprite.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.setPosition = function (pos) {
  this.position.x = pos.x * tileSize - 6;
  this.position.y = pos.y * tileSize - 8;
};

Hero.prototype.updateHero = function (obj, interpolationTime) {
  this.previousState = this.state;
  this.state = obj;
  this.updatedTime = Date.now();

  if (!this.previousState || !interpolationTime) {
    this.setPosition(this.state.pos);
    this.interpolationTime = 0;
  }
  else {
    this.interpolationTime = interpolationTime;
    this.interpolatePosition = manhattan(this.state.pos, this.previousState.pos) === 1;
  }
};

Hero.prototype.render = function () {
  if (!this.interpolationTime) return;
  var p = smoothstep(this.updatedTime, this.updatedTime+this.interpolationTime, Date.now());
  if (this.interpolatePosition) {
    this.setPosition(interpolatePosition(this.previousState.pos, this.state.pos, p));
  }
};

Hero.prototype.getTexture = function () {
  return heroTextures[this.state.id - 1];
};

module.exports = Hero;
