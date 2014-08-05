var PIXI = require("pixi.js");
var tilePIXI = require("./tilePIXI");

var tilePIXI24 = tilePIXI(24);

var tileSize = 24;

function cachedF (f) {
  var result;
  return function () {
    if (!result) result = f();
    return result.apply(this, arguments);
  };
}

module.exports = {

  forest: cachedF(function () {
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

    return function (game, container) {
      var size = game.board.size;
      var topLeft = new PIXI.Sprite(topLeftCornerTexture);
      topLeft.x = -tileSize;
      topLeft.y = -tileSize;
      container.addChild(topLeft);

      var bottomLeft = new PIXI.Sprite(bottomLeftCornerTexture);
      bottomLeft.x = -tileSize;
      bottomLeft.y = tileSize * size;
      container.addChild(bottomLeft);

      var topRight = new PIXI.Sprite(topRightCornerTexture);
      topRight.x = tileSize * size;
      topRight.y = -tileSize;
      container.addChild(topRight);

      var bottomRight = new PIXI.Sprite(bottomRightCornerTexture);
      bottomRight.x = tileSize * size;
      bottomRight.y = tileSize * size;
      container.addChild(bottomRight);

      for (var i=0; i<size; ++i) {
        var left = new PIXI.Sprite(leftBorderTexture);
        var right = new PIXI.Sprite(rightBorderTexture);
        var top = new PIXI.Sprite(topBorderTexture);
        var bottom = new PIXI.Sprite(bottomBorderTexture);
        top.y = left.x = -tileSize;
        bottom.y = right.x = tileSize * size;
        top.x = bottom.x = left.y = right.y = i * tileSize;
        container.addChild(top);
        container.addChild(right);
        container.addChild(bottom);
        container.addChild(left);
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
        container.addChild(group);
      }, this);

    };
  })
};


