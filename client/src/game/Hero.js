var PIXI = require("pixi.js");
var smoothstep = require("smoothstep");
var tilePIXI = require("./tilePIXI");

function step (min, max, value) {
  var x = Math.max(0, Math.min(1, (value-min)/(max-min)));
  return x;
}

function mix (a, b, p) {
  return a + (b-a) * p;
}

var tileSize = 24;

var tilePIXI32 = tilePIXI(32);

var heroesTexture = PIXI.Texture.fromImage("/assets/img/fireheart/heroes.png");

var orientations = [3, 2, 0, 1]; // N E S W

var heroTextures = [0, 1, 2, 3].map(function (p) {
  return orientations.map(function (o) {
    return tilePIXI32(heroesTexture, p, o);
  });
});

var blinkTextures = orientations.map(function (o) {
  return tilePIXI32(heroesTexture, 4, o);
});

function manhattan (a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function interpolatePosition (a, b, p) {
  return {
    x: mix(a.x, b.x, p),
    y: mix(a.y, b.y, p)
  };
}

function rgb (r, g, b) {
  /*jshint bitwise: false */
  return ~~(r) << 16 | ~~(g) << 8 | ~~(b);
}

function createHeroSprite (texture) {
  var heroSprite = new PIXI.Sprite(texture);
  heroSprite.rotation = -Math.PI/2;
  heroSprite.pivot.x = 32;
  heroSprite.position.x = -4;
  heroSprite.position.y = -8;
  return heroSprite;
}

function Hero (obj) {
  PIXI.DisplayObjectContainer.call(this);
  this.lifeIndicator = new PIXI.Graphics();
  this.lifeIndicator.position.x = -5;
  this.lifeIndicator.position.y = 0;
  this.addChild(this.lifeIndicator);

  this.heroSprite = createHeroSprite(heroTextures[obj.id - 1][0]);
  this.blinkSprite = createHeroSprite(blinkTextures[0]);
  this.blinkSprite.alpha = 0;

  this.addChild(this.heroSprite);
  this.addChild(this.blinkSprite);

  this.interpolationEndTime = 0;
  this.playerOrientation = 0;

  this.updateHero(obj);
}

Hero.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.analyzeDiff = function (/* some parameters */) {
  // TODO
  return {
    // All meta data we need should go here
    myturn: true || false,
    orientation: 0, // orientation of the current action
    moved: null || { dx: 1, dy: 0 },
    reborn: true || false,
    attack: null || [{ hero: 1, life: 0 }],
    attacked: null || [{ hero: 1, pos: { x: 0, y: 0 } }],
    dead: true || false,
    takeMine: null || { pos: {x:0,y:0}, owner: null||1 },
    drink: null || { pos: {x:0,y:0} }
  };
};

Hero.prototype.refreshHeroSprite = function () {
  var orientation = this.playerOrientation;
  this.heroSprite.setTexture(heroTextures[this.state.id - 1][orientation]);
  this.blinkSprite.setTexture(blinkTextures[orientation]);
};

Hero.prototype.drawLifeIndicator = function (life) {
  var lpx = Math.round(tileSize * life / 100);
  var color = rgb(255 * smoothstep(60, 30, life), 255 * smoothstep(0, 90, life), 50);
  this.lifeIndicator.clear();
  var graphics = this.lifeIndicator;
  graphics.beginFill(color);
  graphics.drawRect(0, tileSize - lpx, 3, lpx);
};

Hero.prototype.setPosition = function (pos) {
  this.position.x = pos.x * tileSize;
  this.position.y = pos.y * tileSize;
};

Hero.prototype.updateHero = function (obj, interpolationTime) {
  // if (Date.now() < this.interpolationEndTime) return; // we'll need something like that when interpolationTime > refreshRate
  this.previousState = this.state;
  this.state = obj;
  this.updatedTime = Date.now();
  this.refreshHeroSprite();

  if (!this.previousState || !interpolationTime) {
    this.setPosition(this.state.pos);
    this.drawLifeIndicator(this.state.life);
    this.interpolationTime = 0;
    this.interpolationEndTime = this.updatedTime;
  }
  else {
    this.interpolationTime = interpolationTime;
    this.interpolationEndTime = this.updatedTime + this.interpolationTime;
    this.interpolatePosition = manhattan(this.state.pos, this.previousState.pos) === 1;
  }

  if (this.previousState) {
    this.wasDamaged = this.state.life < this.previousState.life - 1;
    var dx = this.state.pos.x - this.previousState.pos.x;
    var dy = this.state.pos.y - this.previousState.pos.y;
    if (dx === 1 && dy === 0) {
      this.playerOrientation = 1;
    }
    else if (dx === -1 && dy === 0) {
      this.playerOrientation = 3;
    }
    else if (dx === 0 && dy === 1) {

      this.playerOrientation = 2;
    }
    else if (dx === 0 && dy === -1) {
      this.playerOrientation = 0;
    }
  }
  else {
    this.wasDamaged = false;
  }

  if (this.wasDamaged) {
    this.blinkSprite.alpha = 1;
  }
  else {
    this.blinkSprite.alpha = 0;
  }
};

Hero.prototype.render = function () {
  if (!this.interpolationTime) return;
  var p = step(this.updatedTime, this.updatedTime+this.interpolationTime, Date.now());
  if (this.interpolatePosition) {
    this.setPosition(interpolatePosition(this.previousState.pos, this.state.pos, p));
  }
  this.drawLifeIndicator(mix(this.previousState.life, this.state.life, p));
  if (this.wasDamaged) {
    this.blinkSprite.alpha = p < 0.2 ? 1 : 0;
  }
};

Hero.prototype.getTexture = function () {
  return heroTextures[this.state.id - 1][0];
};

module.exports = Hero;
