var PIXI = require("pixi.js");
var tilePIXI = require("./tilePIXI");
var loadTexture = require("./loadTexture");

var bloodSoilTexture = loadTexture("blood.png");
var bloodsAll = [];
for (var i=0; i<4; ++i) {
  var b = [];
  for (var j=0; j<7; ++j) {
    b.push(tilePIXI(32)(bloodSoilTexture, j, i));
  }
  bloodsAll.push(b);
}

function BloodySoil (value) {
  PIXI.DisplayObjectContainer.call(this);
  this.bloods = bloodsAll[Math.floor(Math.random()*bloodsAll.length)];
  this.spriteFrom = new PIXI.Sprite(this.bloods[0]);
  this.spriteTo = new PIXI.Sprite(this.bloods[0]);
  this.addChild(this.spriteFrom);
  this.addChild(this.spriteTo);
  this.update(value);
}
BloodySoil.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
BloodySoil.prototype.constructor = BloodySoil;

BloodySoil.prototype.update = function (level) {
  level = Math.max(0, Math.min(level, this.bloods.length-1));
  var from = Math.floor(level);
  if (from === this.bloods.length-1) from --;
  var to = from + 1;
  var p = level - from;
  this.spriteFrom.alpha = 1-p;
  this.spriteTo.alpha = p;
  if (from !== this._from) {
    this._from = from;
    this.spriteFrom.setTexture(this.bloods[from]);
    this.spriteTo.setTexture(this.bloods[to]);
  }
};

module.exports = BloodySoil;
