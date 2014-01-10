//Thanks to http://www.williammalone.com/articles/create-html5-canvas-javascript-sprite-animation/
jQuery( document ).ready(function( $ ) {

    var groundTiles = [];
    var objectTiles = [];

    var groundTileSize = 24;
    var objectTileSize = 32;
    var borderSize = 24;
    var boardSize = game.board.size;

    var canvas = document.getElementById("board");
    canvas.width = groundTileSize * boardSize + borderSize * 2;
    canvas.height = groundTileSize * boardSize + borderSize * 2;

    var groundImage = new Image();
    groundImage.src = assets + "img/tilesets/plowed_soil_24.png";
    // Start the game loop as soon as the sprite sheet is loaded
    groundImage.addEventListener("load", gameLoop);
    groundImage.addEventListener("load", drawBorders);
    groundImage.addEventListener("load", drawGround);
    groundImage.addEventListener("load", drawObjects);

    var grassImage = new Image();
    grassImage.src = assets + "img/tilesets/tallgrass_24.png";

    var goblinImage = new Image();
    goblinImage.src = assets + "img/goblin.png";

    var beerImage = new Image();
    beerImage.src = assets + "img/barrel.png";
    var playerImage = new Image();
    playerImage.src = assets + "img/hero.png";

    var player1Image = new Image();
    player1Image.src = assets + "img/fireheart/player1.png";

    var goblinPlayer1Image = new Image();
    goblinPlayer1Image.src = assets + "img/goblin2_red.png";

    var player2Image = new Image();
    player2Image.src = assets + "img/fireheart/player2.png";

    var goblinPlayer2Image = new Image();
    goblinPlayer2Image.src = assets + "img/goblin2_blue.png";


    var player3Image = new Image();
    player3Image.src = assets + "img/fireheart/player3.png";

    var goblinPlayer3Image = new Image();
    goblinPlayer3Image.src = assets + "img/goblin2_purple.png";

    var player4Image = new Image();
    player4Image.src = assets + "img/fireheart/player4.png";

    var goblinPlayer4Image = new Image();
    goblinPlayer4Image.src = assets + "img/goblin2_white.png";

    function drawGround() {
        $(game.board.tiles).each(function( index ) {
            renderGround(index);
        });
    }


    function drawObjects() {
        $(game.board.tiles).each(function( index ) {
            renderTile(index);
        });
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
        value = game.board.tiles[index];

        switch (value) {
            case '##':
                renderObject(index, {
                    context: canvas.getContext("2d"),
                    width: groundTileSize,
                    height: groundTileSize,
                    image: grassImage,
                    spriteLine: 5,
                    spriteColumn: 2,
                    numberOfFrames: 1
                });

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
                renderObject(index, {
                    context: canvas.getContext("2d"),
                    width: objectTileSize,
                    height: objectTileSize,
                    image: player2Image,
                    numberOfFrames: 1
                });
                break;

            case '@3':
                renderObject(index, {
                    context: canvas.getContext("2d"),
                    width: objectTileSize,
                    height: objectTileSize,
                    image: player3Image,
                    numberOfFrames: 1
                });
                break;
            case '@4':
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

    function renderObject(index, options) {

        if(index < 0 || index > game.board.tiles) return;

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

        if(index < 0 || index > game.board.tiles) return;

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
    }

    function indexToCoordinates(index) {
        var xValue = index % boardSize;
        var yValue = Math.floor(index / boardSize);

        return {x: xValue, y: yValue};
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
        }



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


});
