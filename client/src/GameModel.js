
var initialMeta = {

};
/*
 * idea of meta:
 * - count the number of death per tile (for making bloody soiled)
 * - heroes meta
 */

function GameModel (state, previousState) {
  this.id = state.id;
  this.board = state.board;
  this.finished = state.finished;
  this.heroes = state.heroes;
  this.maxTurns = state.maxTurns;
  this.turn = state.turn;

  this.tilesArray = this.board.tiles.match(/.{2}/g);

  if (previousState) {
    this.meta = this.metaWithPreviousState(previousState);
  }
  else {
    this.meta = initialMeta;
  }
}

function sortByGold(heroA, heroB) {
  return heroB.gold - heroA.gold;
}

GameModel.prototype = {
  metaWithPreviousState: function (previousState) {
    var meta = {};
    previousState = null;
    return meta;
  },
  isOver: function () {
    return this.finished;
  },
  getWinner: function () {
    var heroes = this.heroes.slice();
    heroes.sort(sortByGold);
    if(heroes[0].gold === heroes[1].gold) return -1;
    else return heroes[0].id;
  },

  forEachTile: function (f, ctx) {
    var size = this.board.size;
    this.tilesArray.forEach(function (tile, i) {
      var x = i % size;
      var y = Math.floor(i / size);
      f.call(this, tile, i, x, y);
    }, ctx || this);
  },

  tileAt: function (x, y) {
    return this.tilesArray[this.indexForPosition(x, y)];
  },

  wallAt: function (x, y) {
    var tile = this.tileAt(x, y);
    return tile === undefined || tile === "##";
  },

  indexToPosition: function (i) {
    return {
      x: i % this.board.size,
      y: Math.floor(i / this.board.size)
    };
  },

  indexForPosition: function (x, y) {
    var size = this.board.size;
    if (x < 0 || x >= size || y < 0 || y >= size)
      return null;
    return x + size * y;
  },

  neighborsIndexes: function (x, y) {
    return [
      this.indexForPosition(x, y-1), // TOP
      this.indexForPosition(x+1, y), // RIGHT
      this.indexForPosition(x, y+1), // BOTTOM
      this.indexForPosition(x-1, y) // LEFT
    ];
  },

  neighbors: function (x, y) {
    return this.neighborsIndexes(x, y).map(function (i) {
      if (i === null) return null;
      return this.tilesArray[i];
    }, this);
  },

  getWallStatus: function (x, y) {
    var hasWallNeighbors =
      this.neighborsIndexes(x, y)
      .filter(function (i) { return i !== null && this.tilesArray[i] === "##"; }, this)
      .length > 0;
    return !hasWallNeighbors ? "alone" : "";
  }

};

module.exports = GameModel;
