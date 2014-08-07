var PIXI = require("pixi.js");

var Hero = require("./Hero");
var Mine = require("./Mine");
var Tavern = require("./Tavern");
var requestAnimationFrame = require("raf");
var maps = require("./maps");

// FIXME that should go somewhere
/*
var borderSize = 24;
var tileSize = 24;
*/

var winnerParchmentTexture = PIXI.Texture.fromImage("/assets/img/winner_parchment.png");
var heroTextures = [
  PIXI.Texture.fromImage("/assets/img/fireheart/player1_life.png"),
  PIXI.Texture.fromImage("/assets/img/fireheart/player2_life.png"),
  PIXI.Texture.fromImage("/assets/img/fireheart/player3_life.png"),
  PIXI.Texture.fromImage("/assets/img/fireheart/player4_life.png")
];

function sortSpritesByPosition (a, b) {
  return a.position.y - b.position.y + 0.001 * (a.position.x - b.position.x);
}

function GameBoardRender (container, mapName) {
  this.container = container;
  this.map = maps[mapName||"lowlands"]();
  this.tileSize = this.map.tileSize;
  this.borderSize = this.map.borderSize;
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
    this.boardWidth = this.borderSize * 2 + this.tileSize * this.game.board.size;
    this.renderer = new PIXI.autoDetectRenderer(this.boardWidth, this.boardWidth);
    this.container.appendChild(this.renderer.view);
    this.gameStage = new PIXI.Stage();

    this.gameContainer = new PIXI.DisplayObjectContainer();
    this.gameContainer.x = this.borderSize;
    this.gameContainer.y = this.borderSize;
    this.gameContainer.addChild(this.bgContainer = new PIXI.DisplayObjectContainer());
    this.gameContainer.addChild(this.heroesContainer = this.objectsContainer = new PIXI.DisplayObjectContainer());
    //this.gameContainer.addChild(this.heroesContainer = new PIXI.DisplayObjectContainer());
    this.gameStage.addChild(this.gameContainer);
  },
  
  // Background: borders, ground, wall
  initBackground: function () {
    this.map.generate(this.game, this.bgContainer);
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
        group.position.x = this.tileSize * x;
        group.position.y = this.tileSize * y;
        group.addChild(obj);
        this.objectsContainer.addChild(group);
      }
    }, this);
  },

  initHeroes: function () {
    this.heroes = this.game.heroes.map(function (heroObj) {
      var hero = new Hero(heroObj, this.tileSize);
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
