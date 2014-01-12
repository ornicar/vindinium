//Thanks to http://www.williammalone.com/articles/create-html5-canvas-javascript-sprite-animation/

var assets = "/assets/";

var groundImage = makeImage("img/tilesets/plowed_soil_24.png");
var grassImage = makeImage("img/tilesets/tallgrass_24.png");
var beerImage = makeImage("img/beer2.png");
var farmingImage = makeImage("img/tilesets/farming_fishing_24.png");
var plantsImage = makeImage("img/tilesets/plants_24.png");
var stuffImage = makeImage("img/tilesets/stuff.png");
var goblinImage = makeImage("img/mine_neutral.png");

var player1Image = makeImage("img/fireheart/player1_life.png");
var goblinPlayer1Image = makeImage("img/mine_1.png");
var player2Image = makeImage("img/fireheart/player2_life.png");
var goblinPlayer2Image = makeImage("img/mine_2.png");
var player3Image = makeImage("img/fireheart/player3_life.png");
var goblinPlayer3Image = makeImage("img/mine_3.png");
var player4Image = makeImage("img/fireheart/player4_life.png");
var goblinPlayer4Image = makeImage("img/mine_4.png");

var zeldaTree1Image = makeImage("img/zelda/tree.png");
var winnerParchmentImage = makeImage("img/winner_parchment.png");

var playerImages = [player1Image, player2Image, player3Image, player4Image];

function makeImage(src) {
  var img = new Image();
  img.src = assets + src;
  return img;
}

function cloneCanvas(oldCanvas) {
    //create a new canvas
    var newCanvas = document.createElement('canvas');
    var context = newCanvas.getContext('2d');
    //set dimensions
    newCanvas.width = oldCanvas.width;
    newCanvas.height = oldCanvas.height;
    //apply the old canvas to the new one
    context.drawImage(oldCanvas, 0, 0);
    //return the new canvas
    return newCanvas;
}

var groundTileSize = 24;
var objectTileSize = 32;
var borderSize = 24;
var firstRender = true;
var background; // canvas with static elements, drawn only once

function drawPosition(game) {

    var canvas = document.getElementById("board");
    var boardSize = game.board.size;

    var boardWidth = borderSize*2 + groundTileSize * boardSize;

    if (firstRender) {
      canvas.width = groundTileSize * boardSize + borderSize * 2;
      canvas.height = groundTileSize * boardSize + borderSize * 2;
    }

    // preload tiles parsing
    game.board.tilesArray = game.board.tiles.match(/.{2}/g);

    updateGold();

    // draw state
    if (firstRender) {
      drawBackground();
      background = cloneCanvas(canvas);
      firstRender = false;
    }
    canvas.width = canvas.width;
    var context = canvas.getContext('2d');
    context.drawImage(background, 0, 0);
    drawState();

    function updateGold() {
        for(i=0; i<game.heroes.length; i++) {
            $("#player" + (i+1) +" span").text(game.heroes[i].gold);
        }
        var winner = getWinner();
        $('#gold>li').removeClass('first');

        //If not draw
        if(winner >= 0) $("#player" + winner).addClass('first');

        $('#gold').show();
    }

    function getWinner() {
        //copy the array
        var heroes = game.heroes.slice();
        heroes.sort(sortByGold);

        //Draw
        if(heroes[0].gold == heroes[1].gold) return -1;
        else return heroes[0].id;
    }

    function sortByGold(heroA, heroB) {
        return heroB.gold - heroA.gold;
    }

    function drawBackground() {
        drawBorders();
        $(game.board.tilesArray).each(function(index) {
          renderGround(index);
          var tile = game.board.tilesArray[index];
            if (tile == '##') renderWall(index);
        });
    }

    function drawState() {
        $(game.board.tilesArray).each(renderTile);

        if(game.finished == true) {

            var winner = getWinner();

            var width = 240;
            var height = 113;

            canvas.getContext("2d").drawImage(winnerParchmentImage, 0, 0, width, height, (boardWidth - width)/2, (boardWidth - height)/2, width, height);

            context.fillStyle = "black";
            context.font = "bold 16px Arial";

            if(winner == -1) {
                context.fillText("Draw!", (boardWidth - width)/2 + 100, (boardWidth - height)/2 + 45);
                context.fillText("No winner :(", (boardWidth - width)/2 + 80, (boardWidth - height)/2 + 70);
            } else {
                context.fillText("And the winner is…", (boardWidth - width)/2 + 50, (boardWidth - height)/2 + 45);

            canvas.getContext("2d").drawImage(playerImages[winner-1], 0, 0, objectTileSize, objectTileSize, (boardWidth - width)/2 + 103, (boardWidth - height)/2 + 60, objectTileSize, objectTileSize);

            }

        }
    }

    function drawBorders() {

        //Draw the corners
        var topLeftCornerTile = sprite({
            context: canvas.getContext("2d"),
            width: groundTileSize,
            height: groundTileSize,
            image: groundImage,
            spriteLine: 2,
            numberOfFrames: 1
        });

        topLeftCornerTile.renderAtPosition(0, 0);

        var bottomLeftCornerTile = sprite({
            context: canvas.getContext("2d"),
            width: groundTileSize,
            height: groundTileSize,
            image: groundImage,
            spriteLine: 4,
            numberOfFrames: 1
        });

        bottomLeftCornerTile.renderAtPosition(0, boardSize+1);

        var bottomRightCornerTile = sprite({
            context: canvas.getContext("2d"),
            width: groundTileSize,
            height: groundTileSize,
            image: groundImage,
            spriteLine: 4,
            spriteColumn: 2,
            numberOfFrames: 1
        });

        bottomRightCornerTile.renderAtPosition(boardSize+1, boardSize+1);

        var topRightCornerTile = sprite({
            context: canvas.getContext("2d"),
            width: groundTileSize,
            height: groundTileSize,
            image: groundImage,
            spriteLine: 2,
            spriteColumn: 2,
            numberOfFrames: 1
        });

        topRightCornerTile.renderAtPosition(boardSize+1, 0);

        //Draw the borders
        var topBorderTile = sprite({
            context: canvas.getContext("2d"),
            width: groundTileSize,
            height: groundTileSize,
            image: groundImage,
            spriteLine: 2,
            spriteColumn: 1,
            numberOfFrames: 1
        });

        var bottomBorderTile = sprite({
            context: canvas.getContext("2d"),
            width: groundTileSize,
            height: groundTileSize,
            image: groundImage,
            spriteLine: 4,
            spriteColumn: 1,
            numberOfFrames: 1
        });

        var leftBorderTile = sprite({
            context: canvas.getContext("2d"),
            width: groundTileSize,
            height: groundTileSize,
            image: groundImage,
            spriteLine: 3,
            numberOfFrames: 1
        });


        var rightBorderTile = sprite({
            context: canvas.getContext("2d"),
            width: groundTileSize,
            height: groundTileSize,
            image: groundImage,
            spriteLine: 3,
            spriteColumn: 2,
            numberOfFrames: 1
        });

        for(i = 1; i<=boardSize; i++) {
            topBorderTile.renderAtPosition(i, 0);
            bottomBorderTile.renderAtPosition(i, boardSize+1);
            leftBorderTile.renderAtPosition(0, i);
            rightBorderTile.renderAtPosition(boardSize+1, i);
        }
    }

    function renderTile(index) {
        var value = game.board.tilesArray[index];

        switch (value) {

            case '[]':
                  renderObject(index, {
                    context: canvas.getContext("2d"),
                    width: 24,
                    height: 32,
                    image: beerImage,
                    numberOfFrames: 1
                });
                break;

            case '$-':
                renderObject(index, {
                    context: canvas.getContext("2d"),
                    width: objectTileSize,
                    height: 49,
                    image: goblinImage,
                    numberOfFrames: 1
                });

                break;

            case '$1':
                renderObject(index, {
                    context: canvas.getContext("2d"),
                    width: 27,
                    height: 28,
                    image: goblinPlayer1Image,
                    numberOfFrames: 1
                });
                break;

            case '$2':
                renderObject(index, {
                    context: canvas.getContext("2d"), 
                    width: 27,
                    height: 28,
                    image: goblinPlayer2Image,
                    numberOfFrames: 1
                });
                break;

            case '$3':
                renderObject(index, {
                    context: canvas.getContext("2d"),
                    width: 27,
                    height: 28,
                    image: goblinPlayer3Image,
                    numberOfFrames: 1
                });
                break;
            case '$4':
                renderObject(index, {
                    context: canvas.getContext("2d"),
                    width: 27,
                    height: 28,
                    image: goblinPlayer4Image,
                    numberOfFrames: 1
                });
                break;

            case '@1':
                renderPlayer(index, 0);
                break;

            case '@2':
                renderPlayer(index, 1);
                break;

            case '@3':
                renderPlayer(index, 2);
                break;

            case '@4':
                renderPlayer(index, 3);
                break;

            default:
                break;

        }
    }

    function renderPlayer(tileIndex, playerIndex) {
        renderLifeBar(tileIndex, {
            context: canvas.getContext("2d"),
            life: game.heroes[playerIndex].life
        });
        renderObject(tileIndex, {
            context: canvas.getContext("2d"),
            width: objectTileSize,
            height: objectTileSize,
            image: playerImages[playerIndex],
            numberOfFrames: 1
        });

    }

    function renderLifeBar(index, options) {
        if(index < 0 || index > game.board.tilesArray) return;

        var coords = indexToCoordinates(index);
        var x = coords.x;
        var y = coords.y;

        //Destination x
        var xPixels = borderSize + x*groundTileSize-3;
        //Destination y
        var yPixels = borderSize + y*groundTileSize-(objectTileSize-groundTileSize);

        var red = "rgb(218,21,39)";
        var orange = "rgb(238,119,3)";
        var green = "rgb(56,164,42)";


        if(options.life > 66) {
            options.context.fillStyle = green;
        } else if (options.life > 33) {
            options.context.fillStyle = orange;
        } else {
            options.context.fillStyle = red;
        }

        options.context.fillRect(xPixels, yPixels+objectTileSize, 3, -(objectTileSize*options.life/100));
    }

    function renderWall(index) {

        if(!firstRender || index < 0 || index > game.board.tilesArray) return;

        var wallPosition = getWallPosition(index);

        var options = {
            context: canvas.getContext("2d"),
            width: groundTileSize,
            height: groundTileSize,
            image: grassImage,
            spriteLine: 5,
            spriteColumn: 2,
            numberOfFrames: 1
        };

        var possibleSprites = [
            {img: farmingImage, line: 1, column: 1},
            {img: farmingImage, line: 1, column: 5},
            {img: stuffImage, line: 0, column: 0},
            {img: stuffImage, line: 1, column: 0},
            {img: stuffImage, line: 2, column: 0},
            {img: stuffImage, line: 3, column: 0},
        ];

        if(wallPosition == 'alone') {
            var randomSprite = index % possibleSprites.length;
            options.image = possibleSprites[randomSprite].img;
            options.spriteLine = possibleSprites[randomSprite].line;
            options.spriteColumn = possibleSprites[randomSprite].column;
        } else {
            options.image = zeldaTree1Image;
            options.spriteLine = 0;
            options.spriteColumn = 0;
        }


        sprite(options).render(index, borderSize);
    }

    function getWallPosition(index) {

        if(index < 0 || index > game.board.tilesArray) return;

        var neighbors = neighborsAtIndex(index);
        var neighborsArray = [neighbors.top, neighbors.left, neighbors.bottom, neighbors.right];
        var nbWallNeighbors = 0;

        var alone = true;

        for(i=0; i<neighborsArray.length; i++) {
            if(neighborsArray[i] == '##') {
                alone = false;
                nbWallNeighbors++;
            }
        }

        if (alone) return 'alone';

    }

    function renderObject(index, options) {
        if(index < 0 || index > game.board.tilesArray) return;
        sprite(options).render(index, borderSize);
    }

    function renderGround(index) {

        if(index < 0 || index > game.board.tilesgrray) return;

        sprite({
            context: canvas.getContext("2d"),
            width: groundTileSize,
            height: groundTileSize,
            image: groundImage,
            spriteLine: 5,
            numberOfFrames: 1
        }).render(index, borderSize);

        if((index % 10) == 1) {
          sprite({
              context: canvas.getContext("2d"),
              width: groundTileSize,
              height: groundTileSize,
              image: grassImage,
              spriteLine: 5,
              numberOfFrames: 1
          }).render(index, borderSize);
        }

    }

    function indexToCoordinates(index) {
        var xValue = index % boardSize;
        var yValue = Math.floor(index / boardSize);

        return {x: xValue, y: yValue};
    }

    function neighborsAtIndex(index) {
        if(index < 0 || index > game.board.tilesArray) return;

        var coords = indexToCoordinates(index);
        var x = coords.x;
        var y = coords.y;
        var nbNeighbors = 0;

        var topNeighbor, leftNeighbor, bottomNeighbor, rightNeighbor;

        if(y===0) topNeighbor = null;
        else {
            topNeighbor = game.board.tilesArray[coordinatesToIndex(x,y-1)];
            nbNeighbors++;
        }

        if(y==boardSize-1) bottomNeighbor = null;
        else {
            bottomNeighbor = game.board.tilesArray[coordinatesToIndex(x,y+1)];
            nbNeighbors++;
        }

        if(x===0) leftNeighbor = null;
        else {
            leftNeighbor = game.board.tilesArray[coordinatesToIndex(x-1,y)];
            nbNeighbors++;
        }

        if(x==boardSize-1) rightNeighbor = null;
        else {
            rightNeighbor = game.board.tilesArray[coordinatesToIndex(x+1,y)];
            nbNeighbors++;
        }

        return {top: topNeighbor, left: leftNeighbor, bottom: bottomNeighbor, right: rightNeighbor};

    }

    function coordinatesToIndex(x, y) {
        return y*boardSize+x;
    }

    function sprite (options) {

        var that = {},
        frameIndex = 0,
        tickCount = 0,
        ticksPerFrame = options.ticksPerFrame || 0,
        numberOfFrames = options.numberOfFrames || 1;

        that.context = options.context;
        that.width = options.width;
        that.height = options.height;
        that.image = options.image;
        that.loop = options.loop || true;
        that.spriteLine = options.spriteLine || 0;
        that.spriteColumn = options.spriteColumn || 0;

        that.renderAtPosition = function (x, y, shift) {

            shift = typeof shift !== 'undefined' ? shift : 0;

            // Draw the sprite
            that.context.drawImage(
                that.image,
                //Source x
                that.spriteColumn*that.width + frameIndex * that.width,
                //Source y
                that.spriteLine*that.height,
                //Source width
                that.width,
                //Source height
                that.height,
                //Destination x
                shift + x*groundTileSize-((that.width-groundTileSize)/2),
                //Destination y
                shift + y*groundTileSize-(that.height-groundTileSize),
                //Destination width
                that.width,
                //Destination height
            that.height);
        };

        that.render = function (tileIndex, shift) {
            var coords = indexToCoordinates(tileIndex);
            var x = coords.x;
            var y = coords.y;

            that.renderAtPosition(x, y, shift);
        };

        that.update = function () {

            tickCount += 1;

            if (tickCount > ticksPerFrame) {

                tickCount = 0;

                // If the current frame index is in range
                if (frameIndex < numberOfFrames - 1) {
                    // Go to the next frame
                    frameIndex += 1;
                } else if (that.loop) {
                    frameIndex = 0;
                }
            }
        };

        return that;
    }


}
