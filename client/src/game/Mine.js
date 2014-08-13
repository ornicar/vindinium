var PIXI = require("pixi.js");
var smoothstep = require("smoothstep");
var tilePIXI = require("./tilePIXI");
var MineSparkShader = require("./shaders/MineSpark");
var loadTexture = require("./loadTexture");

var goblinTexture = loadTexture("goblin.png");
var minesTextureTile = loadTexture("mines.png");

var tilePIXI32 = tilePIXI(32);
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
  if (owner === "-") return [1,1,1];
  return goldColors[parseInt(owner, 10)-1];
}
function colorDistanceForOwner (owner) {
  if (owner === "-") return 0;
  return colorDistances[parseInt(owner, 10)-1];
}

function setSpriteOwner (sprite, owner) {
  sprite.position.x = -4;
  if (owner === "-") {
    sprite.setTexture(mineTextures[0]);
    sprite.position.y = 0;
  }
  else {
    sprite.setTexture(mineTextures[parseInt(owner, 10)]);
    sprite.position.y = -8;
  }
}

function Mine (owner) {
  PIXI.DisplayObjectContainer.call(this);
  this.previousSprite = new PIXI.Sprite(mineTextures[0]);
  this.currentSprite = new PIXI.Sprite(mineTextures[0]);
  this.mineSparkShader = new MineSparkShader();
  this.currentSprite.filters = [ this.mineSparkShader ];
  this.goblin = new PIXI.Sprite(goblinTexture);
  this.goblin.position.x = -4;
  this.goblin.position.y = -8;
  setSpriteOwner(this.currentSprite, owner);
  this.addChild(this.previousSprite);
  this.addChild(this.currentSprite);
  this.addChild(this.goblin);
  this.updateOwner({ owner: owner, domination: 0 });
  this.startTimeMineSpark = Date.now() - 1000 * Math.PI * 2 * Math.random();
}
Mine.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Mine.prototype.constructor = Mine;

Mine.prototype.updateOwner = function (meta, interpolationTime) {
  var owner = meta.owner;
  // TODO : improve that with meta ?
  this.updatedTime = Date.now();
  this.interpolationTime = interpolationTime;
  this.mineSparkShader.brightness = owner === "-" ? 0.0 : 0.5 + 3.0 * meta.domination;

  this.hasChanged = owner !== this.currentOwner;
  if (this.hasChanged) {
    this.hasChanged = true;
    this.previousOwner = this.currentOwner;
    this.currentOwner = owner;

    this.mineSparkShader.goldcolor = goldColorForOwner(owner);
    this.mineSparkShader.colordistance = colorDistanceForOwner(owner);

    setSpriteOwner(this.currentSprite, this.currentOwner);
    setSpriteOwner(this.previousSprite, this.previousOwner);
    if (!this.interpolationTime) {
      this.previousSprite.alpha = 0;
      this.currentSprite.alpha = 1;
    }
    this.goblin.alpha = (this.currentOwner === "-" ? 1 : 0);
  }
  else {
    this.previousSprite.alpha = 0;
    this.currentSprite.alpha = 1;
  }
};

Mine.prototype.render = function () {
  this.mineSparkShader.time = (Date.now()-this.startTimeMineSpark) / 1000;

  if (this.hasChanged && this.previousOwner && this.interpolationTime) {
    var p = smoothstep(0, this.interpolationTime, Date.now()-this.updatedTime);
    this.previousSprite.alpha = 1-p;
    this.currentSprite.alpha = p;
  }
};


module.exports = Mine;
