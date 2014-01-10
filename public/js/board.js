//Thanks to http://www.williammalone.com/articles/create-html5-canvas-javascript-sprite-animation/

var assets = "/assets/";

var groundImage = new Image();
groundImage.src = assets + "img/tilesets/plowed_soil_24.png";

var grassImage = new Image();
grassImage.src = assets + "img/tilesets/tallgrass_24.png";

var beerImage = new Image();
beerImage.src = assets + "img/barrel.png";

var farmingImage = new Image();
farmingImage.src = assets + "img/tilesets/farming_fishing_24.png";

var plantsImage = new Image();
plantsImage.src = assets + "img/tilesets/plants_24.png";

var goblinImage = new Image();
goblinImage.src = assets + "img/goblin.png";

var player1Image = new Image();
player1Image.src = assets + "img/fireheart/player1_life.png";

var goblinPlayer1Image = new Image();
goblinPlayer1Image.src = assets + "img/goblin2_red.png";

var player2Image = new Image();
player2Image.src = assets + "img/fireheart/player2_life.png";

var goblinPlayer2Image = new Image();
goblinPlayer2Image.src = assets + "img/goblin2_blue.png";

var player3Image = new Image();
player3Image.src = assets + "img/fireheart/player3_life.png";

var goblinPlayer3Image = new Image();
goblinPlayer3Image.src = assets + "img/goblin2_purple.png";

var player4Image = new Image();
player4Image.src = assets + "img/fireheart/player4_life.png";

var goblinPlayer4Image = new Image();
goblinPlayer4Image.src = assets + "img/goblin2_white.png";

window.drawPosition = function(game) {
    var groundTiles = [];
    var objectTiles = [];

    var groundTileSize = 24;
    var objectTileSize = 32;
    var borderSize = 24;
    var boardSize = game.board.size;

    var canvas = document.getElementById("board");
    // clear canvas
    canvas.width = canvas.width;

    canvas.width = groundTileSize * boardSize + borderSize * 2;
    canvas.height = groundTileSize * boardSize + borderSize * 2;


    // preload tiles parsing
    game.board.tilesArray = game.board.tiles.match(/.{2}/g);

    updateGold();

    // draw state
    drawMap();

    function updateGold() {
        for(i=0; i<game.heroes.length; i++) {
            $("#player" + (i+1) +" span").text(game.heroes[i].gold);
        }
        $('#gold').show();
    }

    function drawMap() {
        drawBorders();
        drawGround();
        drawObjects();
    }

    function drawGround() {
        $(game.board.tilesArray).each(renderGround);
    }


    function drawObjects() {
        $(game.board.tilesArray).each(renderTile);
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
        value = game.board.tilesArray[index];

        switch (value) {
            case '##':
                renderWall(index);

                break;


            case '$-':
                renderObject(index, {
                    context: canvas.getContext("2d"),
                    width: objectTileSize,
                    height: objectTileSize,
                    image: goblinImage,
                    numberOfFrames: 1
                });

                break;


            case '$1':
                renderObject(index, {
                    context: canvas.getContext("2d"),
                    width: objectTileSize,
                    height: objectTileSize,
                    image: goblinPlayer1Image,
                    numberOfFrames: 1
                });
                break;

            case '$2':
                renderObject(index, {
                    context: canvas.getContext("2d"),
                    width: objectTileSize,
                    height: objectTileSize,
                    image: goblinPlayer2Image,
                    numberOfFrames: 1
                });
                break;

            case '$3':
                renderObject(index, {
                    context: canvas.getContext("2d"),
                    width: objectTileSize,
                    height: objectTileSize,
                    image: goblinPlayer3Image,
                    numberOfFrames: 1
                });
                break;
            case '$4':
                renderObject(index, {
                    context: canvas.getContext("2d"),
                    width: objectTileSize,
                    height: objectTileSize,
                    image: goblinPlayer4Image,
                    numberOfFrames: 1
                });
                break;

            case '@1':
                renderLifeBar(index, {
                    context: canvas.getContext("2d"),
                    life: game.heroes[0].life
                });
                renderObject(index, {
                    context: canvas.getContext("2d"),
                    width: objectTileSize,
                    height: objectTileSize,
                    image: player1Image,
                    numberOfFrames: 3,
                    loop: true,
                    ticksPerFrame: 15
                });
                break;

            case '@2':
                renderLifeBar(index, {
                    context: canvas.getContext("2d"),
                    life: game.heroes[1].life
                });
                renderObject(index, {
                    context: canvas.getContext("2d"),
                    width: objectTileSize,
                    height: objectTileSize,
                    image: player2Image,
                    numberOfFrames: 1
                });
                break;

            case '@3':
                renderLifeBar(index, {
                    context: canvas.getContext("2d"),
                    life: game.heroes[2].life
                });
                renderObject(index, {
                    context: canvas.getContext("2d"),
                    width: objectTileSize,
                    height: objectTileSize,
                    image: player3Image,
                    numberOfFrames: 1
                });
                break;
            case '@4':
                renderLifeBar(index, {
                    context: canvas.getContext("2d"),
                    life: game.heroes[3].life
                });
                renderObject(index, {
                    context: canvas.getContext("2d"),
                    width: objectTileSize,
                    height: objectTileSize,
                    image: player4Image,
                    numberOfFrames: 1
                });
                break;

            case '[]':
                renderObject(index, {
                    context: canvas.getContext("2d"),
                    width: objectTileSize,
                    height: objectTileSize,
                    image: beerImage,
                    numberOfFrames: 1
                });

                break;
            default:

                break;

        }
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

        options.context.fillRect (xPixels, yPixels+objectTileSize, 3, -(objectTileSize*options.life/100));

        //Lifebar shadow
        options.context.fillStyle = "rgba(0,0,0,0.4)";
        options.context.fillRect (xPixels+3, yPixels+objectTileSize+1, 1, -(objectTileSize*options.life/100));

    }

    function renderWall(index) {

        if(index < 0 || index > game.board.tilesArray) return;

        var neighbors = neighborsAtIndex(index);
        var neighborsArray = [neighbors.top, neighbors.left, neighbors.bottom, neighbors.right];

        var alone = true;

        for(i=0; i<neighborsArray.length; i++) {
            if(neighborsArray[i] == '##') alone = false;
        }


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
            {img: grassImage, line: 5, column: 2}, 
            {img: farmingImage, line: 1, column: 1}, 
            {img: farmingImage, line: 3, column: 1},
            {img: farmingImage, line: 1, column: 5},
            {img: plantsImage, line: 9, column: 4}
        ];

        if(alone) { 
            var randomSprite = Math.floor((Math.random()*possibleSprites.length)); 
            options.image = possibleSprites[randomSprite].img;
            options.spriteLine = possibleSprites[randomSprite].line;
            options.spriteColumn = possibleSprites[randomSprite].column;
        }

        var objectTile;
        if(objectTiles[index]) {
            objectTile = objectTiles[index];
        } else {
            objectTile = sprite(options);
            objectTiles[index] = objectTile;
        }

        objectTile.render(index, borderSize);

    }

    function renderObject(index, options) {

        if(index < 0 || index > game.board.tilesArray) return;

        var objectTile;

        if(objectTiles[index]) {
            objectTile = objectTiles[index];
        } else {
            objectTile = sprite(options);
            objectTiles[index] = objectTile;
        }

        objectTile.render(index, borderSize);

    }

    function renderGround(index) {

        if(index < 0 || index > game.board.tilesgrray) return;

        var groundTile;

        if(groundTiles[index]) {
            groundTile = groundTiles[index];
        } else {

            groundTile = sprite({
                context: canvas.getContext("2d"),
                width: groundTileSize,
                height: groundTileSize,
                image: groundImage,
                spriteLine: 5,
                numberOfFrames: 1
            });

            groundTiles[index] = groundTile;
        }
        groundTile.render(index, borderSize);


        var grassTile = sprite({
            context: canvas.getContext("2d"),
                   width: groundTileSize,
                   height: groundTileSize,
                   image: grassImage,
                   spriteLine: 5,
                   numberOfFrames: 1
        });

        var rdn = Math.floor((Math.random()*10)); 
        if(rdn == 1) {
            grassTile.render(index, borderSize);
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

        var topNeighbor, leftNeighbor, bottomNeighbor, rightNeighbor;

        if(y==0) topNeighbor = null;
        else topNeighbor = game.board.tilesArray[coordinatesToIndex(x,y-1)];

        if(y==boardSize-1) bottomNeighbor = null;
        else bottomNeighbor = game.board.tilesArray[coordinatesToIndex(x,y+1)];

        if(x==0) leftNeighbor = null;
        else leftNeighbor = game.board.tilesArray[coordinatesToIndex(x-1,y)];

        if(x==boardSize-1) rightNeighbor = null;
        else rightNeighbor = game.board.tilesArray[coordinatesToIndex(x+1,y)];

        return {top: topNeighbor, left: leftNeighbor, bottom: bottomNeighbor, right: rightNeighbor};

    }

    function coordinatesToIndex(x, y) {
        return y*boardSize+x;
    }

    function gameLoop () {

        window.requestAnimationFrame(gameLoop);
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

        that.clear = function(tileIndex) {

            var coords = indexToCoordinates(tileIndex);
            var x = coords.x;
            var y = coords.y;
            // Clear the canvas
            that.context.clearRect(x*groundTileSize-((that.width-groundTileSize)/2), y*groundTileSize-(that.height-groundTileSize), that.width, that.height);
        };



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
