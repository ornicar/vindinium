var PIXI = require("pixi.js");
var smoothstep = require("smoothstep");

var goblinTexture = PIXI.Texture.fromImage("/assets/img/mine_neutral.png");

var goblinHeroTextures = [
  PIXI.Texture.fromImage("/assets/img/mine_1.png"),
  PIXI.Texture.fromImage("/assets/img/mine_2.png"),
  PIXI.Texture.fromImage("/assets/img/mine_3.png"),
  PIXI.Texture.fromImage("/assets/img/mine_4.png")
];

function setSpriteOwner (sprite, owner) {
  if (owner === "-") {
    sprite.setTexture(goblinTexture);
    sprite.position.y = -24;
  }
  else {
    sprite.setTexture(goblinHeroTextures[parseInt(owner, 10) - 1]);
    sprite.position.y = -2;
  }
}

function Mine (owner) {
  PIXI.DisplayObjectContainer.call(this);
  this.previousSprite = new PIXI.Sprite(goblinTexture);
  this.currentSprite = new PIXI.Sprite(goblinTexture);
  this.previousSprite.alpha = 0;
  setSpriteOwner(this.currentSprite, owner);
  this.addChild(this.previousSprite);
  this.addChild(this.currentSprite);
  this.updateOwner(owner);
}
Mine.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Mine.prototype.constructor = Mine;

Mine.prototype.updateOwner = function (owner, interpolationTime) {
  if (owner === this.currentOwner) return;
  this.previousOwner = this.currentOwner;
  this.currentOwner = owner;
  this.updatedTime = Date.now();
  this.interpolationTime = this.previousOwner && interpolationTime;

  if (this.interpolationTime) {
    setSpriteOwner(this.previousSprite, this.previousOwner);
  }
  setSpriteOwner(this.currentSprite, this.currentOwner);
};

Mine.prototype.render = function () {
  if (!this.interpolationTime) return;
  var p = smoothstep(0, this.interpolationTime, Date.now()-this.updatedTime);
  this.previousSprite.alpha = 1-p;
  this.currentSprite.alpha = p;
};


module.exports = Mine;
