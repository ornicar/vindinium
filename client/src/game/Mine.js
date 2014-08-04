var PIXI = require("pixi.js");

var goblinTexture = PIXI.Texture.fromImage("/assets/img/mine_neutral.png");

var goblinHeroTextures = [
  PIXI.Texture.fromImage("/assets/img/mine_1.png"),
  PIXI.Texture.fromImage("/assets/img/mine_2.png"),
  PIXI.Texture.fromImage("/assets/img/mine_3.png"),
  PIXI.Texture.fromImage("/assets/img/mine_4.png")
];

function Mine (owner) {
  PIXI.Sprite.call(this, goblinTexture);
  this.updateOwner(owner);
}
Mine.prototype = Object.create(PIXI.Sprite.prototype);
Mine.prototype.constructor = Mine;

Mine.prototype.updateOwner = function (owner) {
  if (owner === this.currentOwner) return;
  this.currentOwner = owner;
  if (owner === "-") {
    this.setTexture(goblinTexture);
    this.position.y = -24;
  }
  else {
    this.setTexture(goblinHeroTextures[parseInt(owner, 10) - 1]);
    this.position.y = -2;
  }
};


module.exports = Mine;
