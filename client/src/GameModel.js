
var bloodWhenTakeMine = 0.3;
var bloodWhenInjured = 0.7;
var bloodWhenKilled = 1.4;

// In move number
var bloodUnderFootPersistence = 2;

// In turn number
var bloodySoilPersistence = 200;
var footprintPersistence = 40;
var footprintBloodPersistence = 40;

function GameModel (state, previousState) {
  this.id = state.id;
  this.board = state.board;
  this.finished = state.finished;
  this.heroes = state.heroes;
  this.maxTurns = state.maxTurns;
  this.turn = state.turn;

  this.tilesArray = this.board.tiles.match(/.{2}/g);

  this.previous = previousState;
  if (previousState) {
    if (!(previousState instanceof GameModel)) throw new Error("previousState must be an instance of GameModel");
    this.meta = this.aggregateMeta(previousState);
  }
  else {
    this.meta = this.initialMeta();
  }
}

function sortByGold(heroA, heroB) {
  return heroB.gold - heroA.gold;
}

function cloneObject (obj) {
  var copy = {};
  for (var k in obj) {
    copy[k] = obj[k];
  }
  return copy;
}

function genEmptyArray (length, fill) {
  var t = [];
  for (var i=0; i<length; ++i)
    t.push(fill);
  return t;
}

function orientationForDelta (dx, dy) {
  if (dx === 1 && dy === 0) {
    return 1;
  }
  else if (dx === -1 && dy === 0) {
    return 3;
  }
  else if (dx === 0 && dy === 1) {
    return 2;
  }
  else if (dx === 0 && dy === -1) {
    return 0;
  }
  return null;
}

GameModel.prototype = {
  initialMeta: function () {
    var game = this;
    return {
      bloodyGroundFactor: genEmptyArray(this.tilesArray.length, 0),
      footprintFactor: genEmptyArray(this.tilesArray.length, { orientation: 0, foot: 0, blood: 0 }),
      heroes: [1,2,3,4].map(function (id, i) {
        return {
          myturn: false,
          from: null,
          to: game.heroes[i],
          orientation: [0],
          move: null,
          attack: null,
          attacked: null,
          kill: null,
          killed: null,
          takeMine: null,
          drink: null,
          bloodUnderFoot: 0
        };
      })
    };
  },

  aggregateMeta: function (previous) {
    if (previous.turn !== this.turn-1) throw new Error("aggregateMeta: game does not follow! "+previous.turn+"->"+this.turn);

    var meta = cloneObject(previous.meta);
    meta.heroes = previous.meta.heroes.map(cloneObject);
    meta.heroes.forEach(function (hero, i) {
      hero.myturn = false;
      hero.move = null;
      hero.takeMine = null;
      hero.drink = null;
      hero.kill = null;
      hero.attack = null;
      hero.killed = null;
      hero.attacked = null;
      hero.orientation = [hero.orientation[hero.orientation.length-1]];
      hero.from = previous.heroes[i];
      hero.to = this.heroes[i];
    }, this);

    // Compute last hero meta
    var heroIndex = previous.turn % 4;
    var hero = this.heroes[heroIndex];
    var previousHero = previous.heroes[heroIndex];
    var heroMeta = cloneObject(meta.heroes[heroIndex]);
    var previousHeroMeta = previous.meta.heroes[heroIndex];
    var previousPositionIndex = previous.indexForPosition(previousHero.pos.x, previousHero.pos.y);
    var previousNeighborsIndexes = previous.neighborsIndexes(previousHero.pos.x, previousHero.pos.y);

    var touchingTaverns = previousNeighborsIndexes
      .map(function (i) { return previous.tilesArray[i] === "[]" ? i : null; })
      .filter(function (tile) { return tile !== null; });

    var touchingMines = previousNeighborsIndexes
      .map(function (i) {
        var tile = previous.tilesArray[i];
        return tile && tile[0] === "$" ? i : null; })
      .filter(function (tile) { return tile !== null; });

    var takenMines = touchingMines.filter(function (i) {
      var heroId = hero.id.toString();
      return previous.tilesArray[i][1] !== heroId && this.tilesArray[i][1] === heroId;
    }, this);

    var opponents = [1,2,3,4].filter(function (id) {
      return id !== hero.id;
    });

    var opponentsInjured = opponents.filter(function (i) {
      var prevOpponent = previous.heroes[i-1];
      var opponent = this.heroes[i-1];
      return opponent.life < prevOpponent.life-1;
    }, this);

    var opponentsKilled = opponents.filter(function (i) {
      var prevOpponent = previous.heroes[i-1];
      var opponent = this.heroes[i-1];
      return opponent.life === 100 && prevOpponent.life <= 20;
    }, this);

    var opponentsAttacked = opponentsInjured.concat(opponentsKilled);

    var p;
    var dx = hero.pos.x - previousHero.pos.x;
    var dy = hero.pos.y - previousHero.pos.y;

    // Creating the current hero meta

    heroMeta.myturn = true;

    heroMeta.drink = touchingTaverns.length && hero.life > previousHero.life && touchingTaverns || null;
    heroMeta.move = !(dx===0 && dy===0) && { dx: dx, dy: dy } || null;
    heroMeta.takeMine = takenMines.length && takenMines || null;
    heroMeta.attack = opponentsAttacked.length && opponentsAttacked || null;
    heroMeta.kill = opponentsKilled.length && opponentsKilled || null;

    var motionOrientation = orientationForDelta(dx, dy);
    var orientation = [];
    orientation.push(motionOrientation);
    if (heroMeta.attack) {
      p = previous.heroes[opponentsAttacked[0]-1].pos;
      orientation.push(orientationForDelta(p.x - previousHero.pos.x, p.y - previousHero.pos.y));
    }
    if (heroMeta.drink) {
      p = previous.indexToPosition(touchingTaverns[0]);
      orientation.push(orientationForDelta(p.x - previousHero.pos.x, p.y - previousHero.pos.y));
    }
    orientation = orientation.filter(function (o) { return o !== null; });
    if (orientation.length === 0) orientation.push(previousHeroMeta.orientation[previousHeroMeta.orientation.length-1]);
    
    heroMeta.orientation = orientation;

    // Record metas

    meta.heroes[hero.id-1] = heroMeta;
    opponentsAttacked.forEach(function (id) {
      meta.heroes[id-1].attacked = hero.id;
    });
    opponentsKilled.forEach(function (id) {
      meta.heroes[id-1].killed = hero.id;
      meta.heroes[id-1].bloodUnderFoot = 0;
    });


    meta.bloodyGroundFactor = meta.bloodyGroundFactor.map(function (v) {
      return Math.max(0, v - 1 / bloodySoilPersistence);
    });
    opponentsInjured.forEach(function (id) {
      var pos = previous.heroes[id-1].pos;
      meta.bloodyGroundFactor[previous.indexForPosition(pos.x, pos.y)] += bloodWhenInjured;
    });
    opponentsKilled.forEach(function (id) {
      var pos = previous.heroes[id-1].pos;
      meta.bloodyGroundFactor[previous.indexForPosition(pos.x, pos.y)] += bloodWhenKilled;
    });
    if (heroMeta.takeMine) {
      meta.bloodyGroundFactor[previousPositionIndex] += bloodWhenTakeMine;
    }

    meta.footprintFactor = meta.footprintFactor.map(function (v) {
      var foot = Math.max(0, v.foot - 1 / footprintPersistence);
      var blood = Math.max(0, v.blood - 1 / footprintBloodPersistence);
      return {
        orientation: v.orientation,
        foot: foot,
        blood: blood
      };
    });
    if (heroMeta.move) {
      heroMeta.bloodUnderFoot = Math.max(meta.bloodyGroundFactor[previousPositionIndex], heroMeta.bloodUnderFoot - 1 / bloodUnderFootPersistence);
      meta.footprintFactor[previousPositionIndex] = {
        orientation: motionOrientation,
        foot: 1,
        blood: heroMeta.bloodUnderFoot
      };
    }

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
