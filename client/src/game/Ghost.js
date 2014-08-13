var PIXI = require("pixi.js");
var smoothstep = require("smoothstep");
var GhostEffect = require("./shaders/GhostEffect");
var Hero = require("./Hero");

function Ghost (hero, interpolationTime) {
  PIXI.DisplayObjectContainer.call(this);
  this.dead = false;
  this.phantomSprite = new PIXI.Sprite(Hero.blinkTextures[hero.meta.orientation || 0]);
  this.phantomSprite.position.x = -4;
  this.phantomSprite.position.y = -8;
  this.effect = new GhostEffect();
  this.phantomSprite.filters = [ this.effect ];
  this.startTime = Date.now();
  this.duration = 1500 + 10 * interpolationTime;
  this.addChild(this.phantomSprite);
}

Ghost.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Ghost.prototype.constructor = Ghost;

Ghost.prototype.destroy = function () {
  this.parent.removeChild(this);
};

Ghost.prototype.render = function () {
  var progress = Math.min((Date.now() - this.startTime) / this.duration, 1);
  this.effect.progress = progress;
  this.alpha = 0.7 * smoothstep(1.0, 0.6, progress);
  if (progress === 1)
    this.destroy();
};

module.exports = Ghost;
