var PIXI = require("pixi.js");
var requestAnimationFrame = require("raf");

var Hero = require("./Hero");
var Mine = require("./Mine");
var Tavern = require("./Tavern");
var maps = require("./maps");
var BloodySoil = require("./BloodySoil");
var loadTexture = require("./loadTexture");

var winnerParchmentTexture = loadTexture("winner_parchment.png");

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
    var consecutiveTurn = this.game && game.turn === this.game.turn+1;
    this.game = game;
    //console.log("Turn "+this.game.turn+" - Hero"+(1+this.game.turn % 4));
    this.game.meta.heroes.forEach(function (meta, i) {
      var hero = this.heroes[i];
      //console.log(hero.logMeta(meta));
      hero.updateHero(meta, interpolationTime, consecutiveTurn);
    }, this);

    this.updateBloodySoil();

    // TODO: improve perf of this iteration!
    var mineIndex = 0;
    var nbPerHero = [0,0,0,0];
    var mines = [];
    this.game.forEachTile(function (tile) {
      if (tile[0] === "$") {
        if (tile[1] !== "-")
          nbPerHero[parseInt(tile[1],10)-1] ++;
        mines.push([ this.mines[mineIndex++], tile[1] ]);
      }
    }, this);
    var nbTotal = nbPerHero.reduce(function (a, b) {
      return a + b;
    }, 0);
    mines.forEach(function (mine) {
      var i = mine[1] === "-" ? null : parseInt(mine[1],10)-1;
      mine[0].updateOwner({ owner: mine[1], domination: i===null ? 0 : nbPerHero[i]/nbTotal }, interpolationTime, consecutiveTurn);
    });
    /*
    this.game.forEachTile(function (tile) {
      if (tile[0] === "$") {
        this.mines[mineIndex++].updateOwner(tile[1], interpolationTime, consecutiveTurn);
      }
    }, this);
    */
  },

  updateBloodySoil: function () {
    this.game.meta.bloodyGroundFactor.forEach(function (level, i) {
      var sprite = this._bloodySoil[i];
      if (level || sprite) {
        if (!sprite) {
          sprite = this._bloodySoil[i] = new BloodySoil(level);
          var pos = this.game.indexToPosition(i);
          sprite.pivot.x = (8+this.tileSize)/2;
          sprite.pivot.y = (8+this.tileSize)/2;
          sprite.position.x = pos.x * this.tileSize - 4 + sprite.pivot.x + Math.round(6 * (Math.random()-0.5));
          sprite.position.y = pos.y * this.tileSize - 4 + sprite.pivot.y + Math.round(6 * (Math.random()-0.5));
          sprite.rotation = Math.PI * 2 * Math.random();
          this.bloodySoilContainer.addChild(sprite);
        }
        else {
          sprite.update(level);
        }
      }
    }, this);
  },

  initRendering: function () {
    var size = this.game.board.size;
    this.boardWidth = this.borderSize * 2 + this.tileSize * size;
    this.renderer = new PIXI.autoDetectRenderer(this.boardWidth, this.boardWidth);
    this.container.appendChild(this.renderer.view);
    this.gameStage = new PIXI.Stage();

    this._bloodySoil = [];
    for (var i=0; i<size*size; ++i) {
      this._bloodySoil[i] = null;
    }

    this.gameContainer = new PIXI.DisplayObjectContainer();
    this.gameContainer.x = this.borderSize;
    this.gameContainer.y = this.borderSize;
    this.gameContainer.addChild(this.terrainContainer = new PIXI.DisplayObjectContainer());
    this.gameContainer.addChild(this.terrainContainer2 = new PIXI.DisplayObjectContainer());
    this.gameContainer.addChild(this.bloodySoilContainer = new PIXI.DisplayObjectContainer());
    this.gameContainer.addChild(this.heroesContainer = this.objectsContainer = new PIXI.DisplayObjectContainer());
    this.gameStage.addChild(this.gameContainer);
  },
  
  // Background: borders, ground, wall
  initBackground: function () {
    this.map.generate(this.game, this.terrainContainer, this.terrainContainer2, this.objectsContainer);
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
    this.heroes = this.game.meta.heroes.map(function (heroObj, i) {
      var hero = new Hero(i+1, heroObj, this.tileSize);
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

      var winnerImage = new PIXI.Sprite(this.heroes[winner - 1].getTexture());
      winnerImage.position.x = centerX + 103;
      winnerImage.position.y = centerY + 66;
      this.messageContainer.addChild(winnerImage);
    }
  },


};

module.exports = GameBoardRender;
