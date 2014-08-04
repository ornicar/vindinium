
function sortByGold(heroA, heroB) {
  return heroB.gold - heroA.gold;
}

function GameModel (state) {
  this.id = state.id;
  this.board = state.board;
  this.finished = state.finished;
  this.heroes = state.heroes;
  this.maxTurns = state.maxTurns;
  this.turn = state.turn;

  this.tilesArray = this.board.tiles.match(/.{2}/g);
}

GameModel.prototype = {
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

  getWallStatus: function (x, y) {
    var hasWallNeighbors =
      this.neighborsIndexes(x, y)
      .filter(function (i) { return i !== null && this.tilesArray[i] === "##"; }, this)
      .length > 0;
    return !hasWallNeighbors ? "alone" : "";
  }

};

module.exports = GameModel;
