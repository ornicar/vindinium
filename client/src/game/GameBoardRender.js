var PIXI = require("pixi.js");

var Hero = require("./Hero");
var Mine = require("./Mine");
var Tavern = require("./Tavern");
var requestAnimationFrame = require("raf");

// Initialize all the textures

function tilePIXI (size) {
  return function (baseTexture, x, y) {
    return new PIXI.Texture(baseTexture, { x: x * size, y: y * size, width: size, height: size });
  };
}
var tilePIXI24 = tilePIXI(24);

var groundTilesTexture = PIXI.Texture.fromImage("/assets/img/tilesets/plowed_soil_24.png");
var groundTexture = tilePIXI24(groundTilesTexture, 0, 5);
var topLeftCornerTexture = tilePIXI24(groundTilesTexture, 0, 2);
var bottomLeftCornerTexture = tilePIXI24(groundTilesTexture, 0, 4);
var bottomRightCornerTexture = tilePIXI24(groundTilesTexture, 2, 4);
var topRightCornerTexture = tilePIXI24(groundTilesTexture, 2, 2);
var topBorderTexture = tilePIXI24(groundTilesTexture, 1, 2);
var bottomBorderTexture = tilePIXI24(groundTilesTexture, 1, 4);
var leftBorderTexture = tilePIXI24(groundTilesTexture, 0, 3);
var rightBorderTexture = tilePIXI24(groundTilesTexture, 2, 3);

var grassTilesTexture = PIXI.Texture.fromImage("/assets/img/tilesets/tallgrass_24.png");
var grassTexture = tilePIXI24(grassTilesTexture, 0, 5);
var zeldaTree1Texture = PIXI.Texture.fromImage("/assets/img/zelda/tree.png");

var farmingTexture = PIXI.Texture.fromImage("/assets/img/tilesets/farming_fishing_24.png");
var stuffTexture = PIXI.Texture.fromImage("/assets/img/tilesets/stuff.png");

var possibleWallObjectsTexture = [
  tilePIXI24(farmingTexture, 1, 1),
  tilePIXI24(farmingTexture, 5, 1),
  tilePIXI24(stuffTexture, 0, 0),
  tilePIXI24(stuffTexture, 0, 1),
  tilePIXI24(stuffTexture, 0, 2),
  tilePIXI24(stuffTexture, 0, 3)
];
var winnerParchmentTexture = PIXI.Texture.fromImage("/assets/img/winner_parchment.png");

var heroTextures = [
  PIXI.Texture.fromImage("/assets/img/fireheart/player1_life.png"),
  PIXI.Texture.fromImage("/assets/img/fireheart/player2_life.png"),
  PIXI.Texture.fromImage("/assets/img/fireheart/player3_life.png"),
  PIXI.Texture.fromImage("/assets/img/fireheart/player4_life.png")
];

var borderSize = 24;
var tileSize = 24;

function sortSpritesByPosition (a, b) {
  return a.position.y - b.position.y + 0.001 * (a.position.x - b.position.y);
}

function GameBoardRender (container) {
  this.container = container;
}

GameBoardRender.prototype = {
  setGame: function (game, interpolationTime) {
    if (!this.initialized) {
      this.initGame(game);
      this.initialized = true;
    }
    this.updateGame(game, interpolationTime);
    if (game.isOver()) {
      if (this.messageContainer) {
        this.gameStage.removeChild(this.messageContainer);
      }
      this.gameStage.addChild(this.messageContainer = new PIXI.DisplayObjectContainer());
      this.initGameOver();
    }
    else {
      if (this.messageContainer) {
        this.gameStage.removeChild(this.messageContainer);
        this.messageContainer = null;
      }
    }
    this.objectsContainer.children.sort(sortSpritesByPosition);
    this.renderer.render(this.gameStage);
  },

  destroy: function () {
    this.stopRenderLoop();
    this.container.removeChild(this.renderer.view);
    this.renderer.destroy();
  },

  getHeight: function () {
    return this.boardWidth;
  },

  // Private functions

  initGame: function (game) {
    this.game = game;
    this.initRendering();
    this.initBackground();
    this.initObjects();
    this.initHeroes();
    this.startRenderLoop();
  },

  startRenderLoop: function () {
    var self = this;
    var stopped = this._stopped = (this._stopped || 0)+1;
    (function loop () {
      if (self._stopped !== stopped) return;
      requestAnimationFrame(loop);
      self.render();
    }());
  },

  stopRenderLoop: function () {
    this._stopped ++;
  },

  // Game render loop
  render: function () {
    this.heroes.forEach(function (hero) {
      hero.render();
    });
    this.mines.forEach(function (mine) {
      mine.render();
    });
    this.renderer.render(this.gameStage);
  },

  updateGame: function (game, interpolationTime) {
    this.game = game;
    this.game.heroes.forEach(function (hero, i) {
      this.heroes[i].updateHero(hero, interpolationTime);
    }, this);
    var mineIndex = 0;
    this.game.forEachTile(function (tile) {
      if (tile[0] === "$") {
        this.mines[mineIndex++].updateOwner(tile[1], interpolationTime);
      }
    }, this);
  },

  initRendering: function () {
    this.boardWidth = borderSize * 2 + tileSize * this.game.board.size;
    this.renderer = new PIXI.autoDetectRenderer(this.boardWidth, this.boardWidth);
    this.container.appendChild(this.renderer.view);
    this.gameStage = new PIXI.Stage();
    this.gameContainer = new PIXI.DisplayObjectContainer();
    this.gameContainer.x = borderSize;
    this.gameContainer.y = borderSize;
    this.gameContainer.addChild(this.bgContainer = new PIXI.DisplayObjectContainer());
    this.gameContainer.addChild(this.heroesContainer = this.objectsContainer = new PIXI.DisplayObjectContainer());
    //this.gameContainer.addChild(this.heroesContainer = new PIXI.DisplayObjectContainer());
    this.gameStage.addChild(this.gameContainer);
  },
  
  // Background: borders, ground, wall
  initBackground: function () {
    var game = this.game;
    var size = game.board.size;
    var topLeft = new PIXI.Sprite(topLeftCornerTexture);
    topLeft.x = -tileSize;
    topLeft.y = -tileSize;
    this.bgContainer.addChild(topLeft);

    var bottomLeft = new PIXI.Sprite(bottomLeftCornerTexture);
    bottomLeft.x = -tileSize;
    bottomLeft.y = tileSize * size;
    this.bgContainer.addChild(bottomLeft);

    var topRight = new PIXI.Sprite(topRightCornerTexture);
    topRight.x = tileSize * size;
    topRight.y = -tileSize;
    this.bgContainer.addChild(topRight);

    var bottomRight = new PIXI.Sprite(bottomRightCornerTexture);
    bottomRight.x = tileSize * size;
    bottomRight.y = tileSize * size;
    this.bgContainer.addChild(bottomRight);

    for (var i=0; i<size; ++i) {
      var left = new PIXI.Sprite(leftBorderTexture);
      var right = new PIXI.Sprite(rightBorderTexture);
      var top = new PIXI.Sprite(topBorderTexture);
      var bottom = new PIXI.Sprite(bottomBorderTexture);
      top.y = left.x = -tileSize;
      bottom.y = right.x = tileSize * size;
      top.x = bottom.x = left.y = right.y = i * tileSize;
      this.bgContainer.addChild(top);
      this.bgContainer.addChild(right);
      this.bgContainer.addChild(bottom);
      this.bgContainer.addChild(left);
    }

    // Map
    this.game.forEachTile(function (tile, i, x, y) {
      var group = new PIXI.DisplayObjectContainer();
      group.position.x = tileSize * x;
      group.position.y = tileSize * y;
      group.addChild(new PIXI.Sprite(groundTexture));
      if (i%10 === 1) {
        group.addChild(new PIXI.Sprite(grassTexture));
      }
      if (tile === "##") {
        var wallStatus = this.game.getWallStatus(x, y);
        var wall;
        if(wallStatus === 'alone') {
          wall = new PIXI.Sprite(possibleWallObjectsTexture[ i % possibleWallObjectsTexture.length ]);
        }
        else {
          wall = new PIXI.Sprite(zeldaTree1Texture);
        }
        group.addChild(wall);
      }
      this.bgContainer.addChild(group);
    }, this);
  },

  // Objects: mines, taverns
  initObjects: function () {
    this.mines = [];
    this.taverns = [];
    this.game.forEachTile(function (tile, i, x, y) {
      var obj;
      
      // Objects
      if (tile === "[]") {
        obj = new Tavern();
        this.taverns.push(obj);
      }
      else if (tile[0] === "$") {
        obj = new Mine(tile[1]);
        this.mines.push(obj);
      }
      if (obj) {
        var group = new PIXI.DisplayObjectContainer();
        group.position.x = tileSize * x;
        group.position.y = tileSize * y;
        group.addChild(obj);
        this.objectsContainer.addChild(group);
      }
    }, this);
  },

  initHeroes: function () {
    this.heroes = this.game.heroes.map(function (heroObj) {
      var hero = new Hero(heroObj);
      this.heroesContainer.addChild(hero);
      return hero;
    }, this);
  },

  initGameOver: function () {
    var game = this.game;
    var winner = game.getWinner();
    var boardWidth = this.boardWidth;
    var width = 240;
    var height = 113;

    var centerX = Math.floor((boardWidth - width) / 2);
    var centerY = Math.floor((boardWidth - height) / 2);

    var winnerParchment = new PIXI.Sprite(winnerParchmentTexture);
    winnerParchment.position.x = centerX;
    winnerParchment.position.y = centerY;
    this.messageContainer.addChild(winnerParchment);

    var textOptions = {
      fill: "black",
      font: "bold 16px Arial",
      align: "center"
    };
    var text1, text2;

    if(winner === -1) {
      text1 = new PIXI.Text("Draw!", textOptions);
      text1.position.x = centerX + 100;
      text1.position.y = centerY + 45;
      this.messageContainer.addChild(text1);
      text2 = new PIXI.Text("No winner :(", textOptions);
      text2.position.x = centerX + 80;
      text2.position.y = centerY + 70;
      this.messageContainer.addChild(text2);
    }
    else {
      var name = game.heroes[winner-1].name;
      //Truncate the name if too long
      if(name.length > 23) {
        name = name.substring(0, 23) + "…";
      }

      text1 = new PIXI.Text("And the winner is:", textOptions);
      text1.position.x = Math.floor((boardWidth-text1.width)/2);
      text1.position.y = centerY + 14;
      this.messageContainer.addChild(text1);
      text2 = new PIXI.Text(name, textOptions);
      text2.position.x = Math.floor((boardWidth-text2.width)/2);
      text2.position.y = centerY + 40;
      this.messageContainer.addChild(text2);
      var winnerImage = new PIXI.Sprite(heroTextures[winner - 1]);
      winnerImage.position.x = centerX + 103;
      winnerImage.position.y = centerY + 66;
      this.messageContainer.addChild(winnerImage);
    }
  },


};

module.exports = GameBoardRender;
