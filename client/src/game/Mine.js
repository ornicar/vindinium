var PIXI = require("pixi.js");
var smoothstep = require("smoothstep");
var tilePIXI = require("./tilePIXI");

var goblinTexture = PIXI.Texture.fromImage("/assets/img/goblin.png");
var minesTextureTile = PIXI.Texture.fromImage("/assets/img/mines.png");

var tilePIXI32 = tilePIXI(32);
var mineTextures = [
  tilePIXI32(minesTextureTile, 0, 0),
  tilePIXI32(minesTextureTile, 0, 1),
  tilePIXI32(minesTextureTile, 0, 2),
  tilePIXI32(minesTextureTile, 0, 3),
  tilePIXI32(minesTextureTile, 0, 4)
];

function setSpriteOwner (sprite, owner) {
  if (owner === "-") {
    sprite.setTexture(mineTextures[0]);
    sprite.position.y = 0;
  }
  else {
    sprite.setTexture(mineTextures[parseInt(owner, 10)]);
    sprite.position.y = -2;
  }
}

function Mine (owner) {
  PIXI.DisplayObjectContainer.call(this);
  this.previousSprite = new PIXI.Sprite(mineTextures[0]);
  this.currentSprite = new PIXI.Sprite(mineTextures[0]);
  this.goblin = new PIXI.Sprite(goblinTexture);
  this.goblin.position.y = -8;
  setSpriteOwner(this.currentSprite, owner);
  this.addChild(this.previousSprite);
  this.addChild(this.currentSprite);
  this.addChild(this.goblin);
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
  this.goblin.alpha = (this.currentOwner === "-" ? 1 : 0);
};

Mine.prototype.render = function () {
  if (!this.interpolationTime) return;
  var p = smoothstep(0, this.interpolationTime, Date.now()-this.updatedTime);
  this.previousSprite.alpha = 1-p;
  this.currentSprite.alpha = p;
};


module.exports = Mine;
