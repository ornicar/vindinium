var PIXI = require("pixi.js");
var PerlinNoise = require("perlin-noise");
var seedrandom = require("seedrandom");
var smoothstep = require("smoothstep");
var tilePIXI = require("./tilePIXI");
var loadTexture = require("./loadTexture");

var heroesTexture = loadTexture("heroes.png"); // FIXME we need proper way to centralize the textures
var rezMarks = [3,2,1,0].map(function (p) {
  return tilePIXI(32)(heroesTexture, 4, p);
});

function lazyF (f) {
  var result;
  return function () {
    if (!result) result = f();
    return result;
  };
}

function compassRoseTileName (primaryName, secondaryName, isPrimary, isValidName) {
  return function (x, y) {
    var p = typeof primaryName === "function" ? primaryName(x, y) : primaryName;
    var s = typeof secondaryName === "function" ? secondaryName(x, y) : secondaryName;

    var P = isPrimary(x, y);
    var N  = isPrimary(x, y-1);
    var S  = isPrimary(x, y+1);
    var W  = isPrimary(x-1, y);
    var E  = isPrimary(x+1, y);
    var NW = isPrimary(x-1, y-1);
    var SW = isPrimary(x-1, y+1);
    var NE = isPrimary(x+1, y-1);
    var SE = isPrimary(x+1, y+1);

    var nb = N+S+W+E+NW+SW+NE+SE;
    var name;

    if (P) {
      return p;
    }
    else {
      if (nb===0) return s;
      if (N && S || W && E) return s;

      if (SE && nb===1) name = s+"_"+p+"_se";
      if (isValidName(name)) return name;
      if (SW && nb===1) name = s+"_"+p+"_sw";
      if (isValidName(name)) return name;
      if (NE && nb===1) name = s+"_"+p+"_ne";
      if (isValidName(name)) return name;
      if (NW && nb===1) name = s+"_"+p+"_nw";
      if (isValidName(name)) return name;

      if (N && W) name = p+"_"+s+"_se";
      if (isValidName(name)) return name;
      if (S && W) name = p+"_"+s+"_ne";
      if (isValidName(name)) return name;
      if (N && E) name = p+"_"+s+"_sw";
      if (isValidName(name)) return name;
      if (S && E) name = p+"_"+s+"_nw";
      if (isValidName(name)) return name;

      if (E && !W) name = s+"_"+p+"_e";
      if (isValidName(name)) return name;
      if (W && !E) name = s+"_"+p+"_w";
      if (isValidName(name)) return name;
      if (N && !S) name = s+"_"+p+"_n";
      if (isValidName(name)) return name;
      if (S && !N) name = s+"_"+p+"_s";
      if (isValidName(name)) return name;

      // console.log("couldn't properly find a terrain transition for:", p+'~>'+s, 'at ('+x+","+y+')', +N,+S,+W,+E,+NW,+SW,+NE,+SE);

      return s;
    }
  };
}


module.exports = {

  lowlands: lazyF(function () {
    var tileSize = 24;
    var tilePixi = tilePIXI(tileSize);

    var lowlandsTexture = loadTexture("lowlands_24.png");

    var tilesConf = [
    // Primitive tiles
      ["plain",          1, 1],
      ["water",          3, 2],
      ["earth",          4, 2],
      ["rock",           4, 3],
      ["empty",          3, 3],

    // Water / Plain
      ["water_plain_se", 0, 0],
      ["water_plain_s",  1, 0],
      ["water_plain_sw", 2, 0],
      ["water_plain_e",  0, 1],
      ["water_plain_w",  2, 1],
      ["water_plain_ne", 0, 2],
      ["water_plain_n",  1, 2],
      ["water_plain_nw", 2, 2],
      ["plain_water_se", 3, 0],
      ["plain_water_ne", 3, 1],
      ["plain_water_sw", 4, 0],
      ["plain_water_nw", 4, 1],

    // Earth / Plain
      ["earth_plain_se", 5, 0],
      ["earth_plain_s",  6, 0],
      ["earth_plain_sw", 7, 0],
      ["earth_plain_e",  5, 1],
      ["earth_plain_w",  7, 1],
      ["earth_plain_ne", 5, 2],
      ["earth_plain_n",  6, 2],
      ["earth_plain_nw", 7, 2],
      ["plain_earth_se", 8, 0],
      ["plain_earth_ne", 8, 1],
      ["plain_earth_sw", 9, 0],
      ["plain_earth_nw", 9, 1],

    // Rock / Plain
      ["rock_plain_se", 5, 3],
      ["rock_plain_s",  6, 3],
      ["rock_plain_sw", 7, 3],
      ["rock_plain_e",  5, 4],
      ["rock_plain_w",  7, 4],
      ["rock_plain_ne", 5, 5],
      ["rock_plain_n",  6, 5],
      ["rock_plain_nw", 7, 5],
      ["plain_rock_se", 8, 2],
      ["plain_rock_ne", 8, 3],
      ["plain_rock_sw", 9, 2],
      ["plain_rock_nw", 9, 3],

    // Empty / Plain
      ["empty_plain_se", 0, 3],
      ["empty_plain_s",  1, 3],
      ["empty_plain_sw", 2, 3],
      ["empty_plain_e",  0, 4],
      ["empty_plain_w",  2, 4],
      ["empty_plain_ne", 0, 5],
      ["empty_plain_n",  1, 5],
      ["empty_plain_nw", 2, 5],
      ["plain_empty_se", 3, 4],
      ["plain_empty_ne", 3, 5],
      ["plain_empty_sw", 4, 4],
      ["plain_empty_nw", 4, 5],

    // Water / Earth
      ["water_earth_se",10, 2],
      ["water_earth_s", 11, 2],
      ["water_earth_sw",12, 2],
      ["water_earth_e", 10, 3],
      ["water_earth_w", 12, 3],
      ["water_earth_ne",10, 4],
      ["water_earth_n", 11, 4],
      ["water_earth_nw",12, 4],
      ["earth_water_se", 8, 4],
      ["earth_water_ne", 8, 5],
      ["earth_water_sw", 9, 4],
      ["earth_water_nw", 9, 5],

    // Water / Rock
      ["water_rock_se",13, 2],
      ["water_rock_s", 14, 2],
      ["water_rock_sw",15, 2],
      ["water_rock_e", 13, 3],
      ["water_rock_w", 15, 3],
      ["water_rock_ne",13, 4],
      ["water_rock_n", 14, 4],
      ["water_rock_nw",15, 4],
      ["rock_water_se",12, 0],
      ["rock_water_ne",12, 1],
      ["rock_water_sw",13, 0],
      ["rock_water_nw",13, 1],

    // Plain extras
      ["plain_grass1", 10, 0],
      ["plain_grass2", 11, 0],
      ["plain_grass3", 11, 1],
      ["plain_flower", 10, 1]
    ];
  
    var tiles = {};
    tilesConf.forEach(function (tuple) {
      tiles[tuple[0]] = tilePixi(lowlandsTexture, tuple[1], tuple[2]);
    });

    var farmingTexture = loadTexture("farming_fishing_24.png");
    var stuffTexture = loadTexture("stuff.png");
    var earthStuffs = [ // sorted by priority
      tilePixi(farmingTexture, 5, 1), // medium wood
      tilePixi(farmingTexture, 1, 1), // big wood
      tilePixi(farmingTexture, 0, 4.5), // seeds
      tilePixi(farmingTexture, 6, 2), // tools
      tilePixi(farmingTexture, 0, 6.5), // green weird seeds
      tilePixi(farmingTexture, 6, 0), // forge
      tilePixi(farmingTexture, 1, 3), // seed bag
      tilePixi(farmingTexture, 6, 1), // forge with hammer
      tilePixi(farmingTexture, 7, 2), // hammers
      tilePixi(farmingTexture, 8, 2),  // tools 2
      tilePixi(farmingTexture, 7, 0), // cut tools 1
      tilePixi(farmingTexture, 8, 0), // cut tools 2
      tilePixi(farmingTexture, 7, 1), // cut tools 3
      tilePixi(farmingTexture, 8, 1) // cut tools 4
    ];
    var rockStuffs = [
      tilePixi(stuffTexture, 0, 1),
      tilePixi(stuffTexture, 0, 2),
      tilePixi(stuffTexture, 0, 3)
    ];
    var trees = [
      loadTexture("tree.png")
    ];

    function tileExists (id) {
      return id in tiles;
    }

    function appropriateObjectForTerrain (terrain) {
      if (terrain.indexOf("earth") !== -1) {
        return earthStuffs[Math.floor(Math.random()*Math.random()*earthStuffs.length)];
      }
      if (terrain.indexOf("rock") !== -1) {
        return rockStuffs[Math.floor(Math.random()*rockStuffs.length)];
      }
      return trees[Math.floor(Math.random()*trees.length)];
    }

    function generate (game, terrainContainer, terrainContainer2, objectContainer) {
      seedrandom(game.id, { global: true /* this overrides Math.random! :-D */ });

      var withInnerWater = true;
      var i;
      var size = game.board.size;

      var noise = PerlinNoise.generatePerlinNoise(size, size, {
        octaveCount: 4,
        amplitude: 0.05,
        persistense: 0.3
      });

      var terrainRandomnessFactor = 0.7 + 0.2 * Math.random();
      var terrainMineTavernFactor = 1.4 + 0.8 * Math.random();

      function indexesDistance (i, j) {
        var a = game.indexToPosition(i);
        var b = game.indexToPosition(j);
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        return Math.sqrt(dx*dx + dy*dy);
      }

      var borderTiles = [];
      for (i = 0; i<size; ++i) {
        borderTiles.push(game.indexForPosition(0, i));
        borderTiles.push(game.indexForPosition(size-1, i));
        borderTiles.push(game.indexForPosition(i, 0));
        borderTiles.push(game.indexForPosition(i, size-1));
      }

      var allTiles = [];
      var allTilesType = [];
      for (i = 0; i<size * size; ++i) {
        allTiles.push(i);
        var value = noise[i];
        var mineFactor = 0, tavernFactor = 0;
        var nbMines = 0, nbTaverns = 0;
        for (var j = 0; j < size * size; ++j) {
          if (game.tilesArray[j] === "[]") {
            nbTaverns ++;
            tavernFactor += smoothstep(6, 0, indexesDistance(i, j));
          }
          else if (game.tilesArray[j][0] === "$") {
            nbMines ++;
            mineFactor += smoothstep(9, 1, indexesDistance(i, j));
          }
        }
        tavernFactor /= nbTaverns;
        mineFactor /= nbMines;

        value = value * terrainRandomnessFactor + terrainMineTavernFactor * (mineFactor - tavernFactor);

        allTilesType.push(value < 0.3 ? "earth" : value > 0.8 - 0.1 * Math.random() ? "rock" : "plain" );
      }

      var initialTilesForWaterSearch = withInnerWater ? allTiles : borderTiles;

      function connected (positions, explored, canReach) {
        var news = [];
        positions = positions.filter(canReach);
        explored = positions.concat(explored);
        positions.forEach(function (idx) {
          var pos = game.indexToPosition(idx);
          var indexes = game.neighborsIndexes(pos.x, pos.y)
          .filter(function (i) {
            if (!canReach(i)) return false;
            if (explored.indexOf(i) !== -1) return false;
            if (positions.indexOf(i) !== -1) return false;
            return true;
          });
          news = news.concat(indexes);
        });
        if (news.length) {
          return connected(news, explored, canReach);
        }
        return explored;
      }

      function tileIsWall (i) {
        return i === null || game.tilesArray[i] === "##";
      }

      function indexIsWaterEnoughSurrounded (nb, neighborsFilter) {
        if (!neighborsFilter) neighborsFilter = tileIsWall;
        return function (i) {
          var pos = game.indexToPosition(i);
          var waterNeighbors = game.neighborsIndexes(pos.x, pos.y).filter(neighborsFilter);
          return game.tilesArray[i] === "##" && waterNeighbors.length >= nb;
        };
      }

      var waterTiles = connected(initialTilesForWaterSearch.filter(indexIsWaterEnoughSurrounded(3)), [], indexIsWaterEnoughSurrounded(3));
      waterTiles = waterTiles.filter(indexIsWaterEnoughSurrounded(2, function (i) {
        return waterTiles.indexOf(i) !== -1;
      }));

      function groundForPosition (x, y) {
        if (x === -1) x ++;
        if (y === -1) y ++;
        if (x === size) x --;
        if (y === size) y --;
        var i = game.indexForPosition(x, y);
        return allTilesType[i];
      }

      var compassWaterCoast = compassRoseTileName(groundForPosition, "water", function (x, y) { var i = game.indexForPosition(x, y); return i !== null && waterTiles.indexOf(i) === -1; }, tileExists);

      function genTilesTypeIsNot (outer) {
        return function (x, y) {
          return groundForPosition(x, y) !== outer;
        };
      }

      var plainCount = 0;

      var groundNamesByIndex = [];

      for (var y=-1; y<=size; ++y) {
        for (var x=-1; x<=size; ++x) {
          var isWater = x===-1||x===size||y===-1||y===size||waterTiles.indexOf(game.indexForPosition(x, y)) !== -1;
          var resolver, name, sprite;

          var group = new PIXI.DisplayObjectContainer();
          var group2 = new PIXI.DisplayObjectContainer();
          var groupObject = new PIXI.DisplayObjectContainer();
          groupObject.x = group2.x = group.x = x * tileSize;
          groupObject.y = group2.y = group.y = y * tileSize;

          resolver = compassWaterCoast;
          name = resolver(x, y);
          if (name.indexOf("water") === -1) {
            var better = groundForPosition(x, y);
            if (better !== "plain") {
              var outer = "plain";
              name = compassRoseTileName(outer, better, genTilesTypeIsNot(better), tileExists)(x, y);
            }
          }
          if (name === "plain") {
            ++ plainCount;
            var center = 2*(0.5 - Math.abs(noise[game.indexForPosition(x, y)]-0.5));
            if (Math.random() < 0.2 * center) {
              var choices = [
                "plain_grass1",
                "plain_grass2",
                "plain_flower",
                "plain_grass3"
              ];
              name = choices[Math.floor(Math.random() * Math.random() * 4)];
            }
          }

          groundNamesByIndex[y * size + x] = name;
          sprite = new PIXI.Sprite(tiles[name]);
          group.addChild(sprite);

          if (!isWater && game.wallAt(x, y)) {
            var texture = appropriateObjectForTerrain(name, x, y);
            sprite = new PIXI.Sprite(texture);
            groupObject.addChild(sprite);
          }

          for (var h = 0; h < game.heroes.length; ++h) {
            var spawnPos = game.heroes[h].spawnPos;
            if (spawnPos.x === x && spawnPos.y === y) {
              sprite = new PIXI.Sprite(rezMarks[h]);
              sprite.position.x = -4;
              sprite.position.y = -8;
              sprite.alpha = 0.8;
              group2.addChild(sprite);
            }
          }

          if (group.children.length) terrainContainer.addChild(group);
          if (groupObject.children.length) objectContainer.addChild(groupObject);
          if (group2.children.length) terrainContainer2.addChild(group2);
        }
      }

      return {
        opacityForFootprint: function (i) {
          return groundNamesByIndex[i].indexOf("plain") === 0 ? 1.0 : 0.0;
        }
      };

    }

    return {
      generate: generate,
      borderSize: tileSize,
      tileSize: tileSize
    };
  }),

  forest: lazyF(function () {
    var borderSize = 24;
    var tileSize = 24;
    var tilePIXI24 = tilePIXI(24);

    var groundTilesTexture = loadTexture("plowed_soil_24.png");
    var groundTexture = tilePIXI24(groundTilesTexture, 0, 5);
    var topLeftCornerTexture = tilePIXI24(groundTilesTexture, 0, 2);
    var bottomLeftCornerTexture = tilePIXI24(groundTilesTexture, 0, 4);
    var bottomRightCornerTexture = tilePIXI24(groundTilesTexture, 2, 4);
    var topRightCornerTexture = tilePIXI24(groundTilesTexture, 2, 2);
    var topBorderTexture = tilePIXI24(groundTilesTexture, 1, 2);
    var bottomBorderTexture = tilePIXI24(groundTilesTexture, 1, 4);
    var leftBorderTexture = tilePIXI24(groundTilesTexture, 0, 3);
    var rightBorderTexture = tilePIXI24(groundTilesTexture, 2, 3);
    var grassTilesTexture = loadTexture("tallgrass_24.png");
    var grassTexture = tilePIXI24(grassTilesTexture, 0, 5);
    var zeldaTree1Texture = loadTexture("tree.png");
    var farmingTexture = loadTexture("farming_fishing_24.png");
    var stuffTexture = loadTexture("stuff.png");
    var possibleWallObjectsTexture = [
      tilePIXI24(farmingTexture, 1, 1),
      tilePIXI24(farmingTexture, 5, 1),
      tilePIXI24(stuffTexture, 0, 0),
      tilePIXI24(stuffTexture, 0, 1),
      tilePIXI24(stuffTexture, 0, 2),
      tilePIXI24(stuffTexture, 0, 3)
    ];

    function generate (game, terrainContainer) {
      var size = game.board.size;
      var topLeft = new PIXI.Sprite(topLeftCornerTexture);
      topLeft.x = -borderSize;
      topLeft.y = -borderSize;
      terrainContainer.addChild(topLeft);

      var bottomLeft = new PIXI.Sprite(bottomLeftCornerTexture);
      bottomLeft.x = -borderSize;
      bottomLeft.y = borderSize * size;
      terrainContainer.addChild(bottomLeft);

      var topRight = new PIXI.Sprite(topRightCornerTexture);
      topRight.x = borderSize * size;
      topRight.y = -borderSize;
      terrainContainer.addChild(topRight);

      var bottomRight = new PIXI.Sprite(bottomRightCornerTexture);
      bottomRight.x = borderSize * size;
      bottomRight.y = borderSize * size;
      terrainContainer.addChild(bottomRight);

      for (var i=0; i<size; ++i) {
        var left = new PIXI.Sprite(leftBorderTexture);
        var right = new PIXI.Sprite(rightBorderTexture);
        var top = new PIXI.Sprite(topBorderTexture);
        var bottom = new PIXI.Sprite(bottomBorderTexture);
        top.y = left.x = -borderSize;
        bottom.y = right.x = borderSize * size;
        top.x = bottom.x = left.y = right.y = i * borderSize;
        terrainContainer.addChild(top);
        terrainContainer.addChild(right);
        terrainContainer.addChild(bottom);
        terrainContainer.addChild(left);
      }

      // Map
      game.forEachTile(function (tile, i, x, y) {
        var group = new PIXI.DisplayObjectContainer();
        group.position.x = tileSize * x;
        group.position.y = tileSize * y;
        group.addChild(new PIXI.Sprite(groundTexture));
        if (i%10 === 1) {
          group.addChild(new PIXI.Sprite(grassTexture));
        }
        if (tile === "##") {
          var wallStatus = game.getWallStatus(x, y);
          var wall;
          if(wallStatus === 'alone') {
            wall = new PIXI.Sprite(possibleWallObjectsTexture[ i % possibleWallObjectsTexture.length ]);
          }
          else {
            wall = new PIXI.Sprite(zeldaTree1Texture);
          }
          group.addChild(wall);
        }
        terrainContainer.addChild(group);
      }, this);

    }

    return {
      generate: generate,
      borderSize: borderSize,
      tileSize: tileSize
    };
  })
};


