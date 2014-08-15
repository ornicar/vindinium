var PIXI = require("pixi.js");
var tilePIXI = require("./tilePIXI");
var loadTexture = require("./loadTexture");

var footprintsTexture = loadTexture("footprints.png");
var foots = [0, 1].map(function (o) {
  return tilePIXI(24)(footprintsTexture, o, 0);
});

function Footprint (value, footprintOpacity) {
  PIXI.DisplayObjectContainer.call(this);
  this.footprintOpacity = footprintOpacity;
  this.spriteFrom = new PIXI.Sprite(foots[0]);
  this.spriteTo = new PIXI.Sprite(foots[1]);
  this.spriteTo.position.x = this.spriteFrom.position.x = 12;
  this.spriteTo.position.y = this.spriteFrom.position.y = 12;
  this.spriteTo.pivot.x = this.spriteFrom.pivot.x = 12;
  this.spriteTo.pivot.y = this.spriteFrom.pivot.y = 12;
  this.addChild(this.spriteFrom);
  this.addChild(this.spriteTo);
  this.update(value);
}
Footprint.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Footprint.prototype.constructor = Footprint;

Footprint.prototype.update = function (meta) {
  var foot = meta.foot;
  var levelOfBlood = Math.min(meta.blood, 1);
  var levelOfNoBlood = (1 - levelOfBlood) * this.footprintOpacity;

  this.spriteFrom.alpha = foot * levelOfNoBlood;
  this.spriteTo.alpha = foot * levelOfBlood;
  this.spriteFrom.rotation = meta.orientation * Math.PI / 2;
  this.spriteTo.rotation = meta.orientation * Math.PI / 2;
};

module.exports = Footprint;
