var PIXI = require("pixi.js");
var smoothstep = require("smoothstep");
var Dead = require("./shaders/Dead");
var Hero = require("./Hero");

function DeadBody (hero, duration) {
  PIXI.DisplayObjectContainer.call(this);
  this.dead = false;
  this.phantomSprite = new PIXI.Sprite(Hero.blinkTextures[hero.meta.orientation || 0]);
  this.phantomSprite.position.x = -4;
  this.phantomSprite.position.y = -8;
  this.effect = new Dead();
  this.phantomSprite.filters = [ this.effect ];
  this.startTime = Date.now();
  this.duration = duration;
  this.addChild(this.phantomSprite);
}

DeadBody.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
DeadBody.prototype.constructor = DeadBody;

DeadBody.prototype.destroy = function () {
  this.parent.removeChild(this);
};

DeadBody.prototype.render = function () {
  var progress = Math.min((Date.now() - this.startTime) / this.duration, 1);
  this.effect.progress = progress;
  this.alpha = 0.7 * smoothstep(1.0, 0.5, progress);
  if (progress === 1)
    this.destroy();
};

module.exports = DeadBody;
