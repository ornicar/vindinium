var PIXI = require("pixi.js");
var smoothstep = require("smoothstep");
var tilePIXI = require("./tilePIXI");
var MineSparkShader = require("./shaders/MineSpark");
var loadTexture = require("./loadTexture");

var goblinTextureTile = loadTexture("goblins.png");
var minesTextureTile = loadTexture("mines.png");

var tilePIXI32 = tilePIXI(32);
var goblinTextures = [
  tilePIXI32(goblinTextureTile, 0, 0),
  tilePIXI32(goblinTextureTile, 0, 1),
  tilePIXI32(goblinTextureTile, 0, 2),
  tilePIXI32(goblinTextureTile, 0, 3),
  tilePIXI32(goblinTextureTile, 0, 4)
];
var mineTextures = [
  tilePIXI32(minesTextureTile, 0, 0),
  tilePIXI32(minesTextureTile, 0, 3),
  tilePIXI32(minesTextureTile, 0, 4),
  tilePIXI32(minesTextureTile, 0, 2),
  tilePIXI32(minesTextureTile, 0, 1)
];

var goldColors = [
  [0.8, 0, 0],
  [0, 0.2, 1],
  [0.3, 1, 0],
  [1, 0.8, 0],
];
var colorDistances = [
  0.5,
  1.0,
  0.8,
  0.8
];

function goldColorForOwner (owner) {
  if (owner === 0) return [1,1,1];
  return goldColors[owner-1];
}
function colorDistanceForOwner (owner) {
  if (owner === 0) return 0;
  return colorDistances[owner-1];
}

function setSpriteOwner (sprite, owner) {
  sprite.position.x = -4;
  if (owner === 0) {
    sprite.setTexture(mineTextures[0]);
    sprite.position.y = 0;
  }
  else {
    sprite.setTexture(mineTextures[owner]);
    sprite.position.y = -8;
  }
}
function setGoblinOwner (sprite, owner) {
  sprite.setTexture(goblinTextures[owner]);
}

function Mine (meta, withSpark) {
  PIXI.DisplayObjectContainer.call(this);
  this.previousSprite = new PIXI.Sprite(mineTextures[0]);
  this.currentSprite = new PIXI.Sprite(mineTextures[0]);
  if (withSpark) {
    this.mineSparkShader = new MineSparkShader();
    this.currentSprite.filters = [ this.mineSparkShader ];
  }
  this.goblinFront = new PIXI.Sprite(goblinTextures[0]);
  this.goblinFront.position.x = -4;
  this.goblinFront.position.y = -14;
  this.goblinBack = new PIXI.Sprite(goblinTextures[0]);
  this.goblinBack.position.x = -4;
  this.goblinBack.position.y = -20;
  this.addChild(this.goblinBack);
  this.addChild(this.previousSprite);
  this.addChild(this.currentSprite);
  this.addChild(this.goblinFront);
  this.updateOwner(meta);
  this.startTimeMineSpark = Date.now() - 1000 * Math.PI * 2 * Math.random();
}
Mine.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Mine.prototype.constructor = Mine;

Mine.prototype.updateOwner = function (meta, interpolationTime) {
  var owner = meta.owner;
  // TODO : improve that with meta ?
  this.updatedTime = Date.now();
  this.interpolationTime = interpolationTime;
  if (this.mineSparkShader) {
    this.mineSparkShader.brightness = owner === 0 ? 0.0 : 0.5 + 3.0 * meta.domination;
  }

  var goblinVisible = meta.adjacentOpponents.length>0;
  this.ownerChanged = owner !== this.currentOwner;
  this.goblinVisibleChanged = goblinVisible !== this.goblinVisible;
  if (this.ownerChanged || this.goblinVisibleChanged) {
    this.goblinVisible = goblinVisible;
    this.previousOwner = this.currentOwner||0;
    this.currentOwner = owner;

    if (this.mineSparkShader) {
      this.mineSparkShader.goldcolor = goldColorForOwner(owner);
      this.mineSparkShader.colordistance = colorDistanceForOwner(owner);
    }

    setGoblinOwner(this.goblinBack, this.previousOwner);
    setGoblinOwner(this.goblinFront, this.previousOwner);
    setSpriteOwner(this.currentSprite, this.currentOwner);
    setSpriteOwner(this.previousSprite, this.previousOwner);
    if (!this.interpolationTime) {
      this.previousSprite.alpha = 0;
      this.currentSprite.alpha = 1;
    }
    this.goblinFront.alpha = goblinVisible ? 1 : 0;
    this.goblinBack.alpha = 1 - this.goblinFront.alpha;
  }
  else {
    this.previousSprite.alpha = 0;
    this.currentSprite.alpha = 1;
  }
};

Mine.prototype.render = function () {
  if (this.mineSparkShader) {
    this.mineSparkShader.time = (Date.now()-this.startTimeMineSpark) / 1000;
  }

  if (this.ownerChanged && this.previousOwner && this.interpolationTime) {
    var p = smoothstep(0, this.interpolationTime, Date.now()-this.updatedTime);
    this.previousSprite.alpha = 1-p;
    this.currentSprite.alpha = p;
  }
};


module.exports = Mine;
