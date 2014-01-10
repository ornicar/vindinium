//Thanks to http://www.williammalone.com/articles/create-html5-canvas-javascript-sprite-animation/
jQuery( document ).ready(function( $ ) {

    /**
    var map = ['  ', 'XX', 'XX', '  ', 
               '  ', 'XX', 'XX', '  ',
               '  ', '$-', 'XX', '@1',
               '[]', '  ', '  ', '  '];
               **/


    var groundTiles = [];
    var objectTiles = [];

    var groundTileSize = 24;
    var objectTileSize = 32;
    var boardSize = game.board.size;

    var canvas = document.getElementById("board");
    canvas.width = groundTileSize * boardSize;
    canvas.height = groundTileSize * boardSize;

    var groundImage = new Image();
    groundImage.src = assets + "img/tilesets/plowed_soil_24.png";
    // Start the game loop as soon as the sprite sheet is loaded
    groundImage.addEventListener("load", gameLoop);
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

    function renderTile(index) {
        value = game.board.tiles[index];

        switch (value) {
            case '##':
                sprite({
                    context: canvas.getContext("2d"),
                    width: groundTileSize,
                    height: groundTileSize,
                    image: grassImage,
                    spriteLine: 5,
                    spriteColumn: 2,
                    numberOfFrames: 1
                }).render(index, false);

                break;


            case '$-':
                sprite({
                    context: canvas.getContext("2d"),
                    width: objectTileSize,
                    height: objectTileSize,
                    image: goblinImage,
                    numberOfFrames: 1
                }).render(index, false);

                break;


            case '$1':
                sprite({
                    context: canvas.getContext("2d"),
                    width: objectTileSize,
                    height: objectTileSize,
                    image: goblinPlayer1Image,
                    numberOfFrames: 1
                }).render(index, false);
                break;

            case '$2':
                sprite({
                    context: canvas.getContext("2d"),
                    width: objectTileSize,
                    height: objectTileSize,
                    image: goblinPlayer2Image,
                    numberOfFrames: 1
                }).render(index, false);
                break;

            case '$3':
                sprite({
                    context: canvas.getContext("2d"),
                    width: objectTileSize,
                    height: objectTileSize,
                    image: goblinPlayer3Image,
                    numberOfFrames: 1
                }).render(index, false);
                break;
            case '$4':
                sprite({
                    context: canvas.getContext("2d"),
                    width: objectTileSize,
                    height: objectTileSize,
                    image: goblinPlayer4Image,
                    numberOfFrames: 1
                }).render(index, false);
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
                sprite({
                    context: canvas.getContext("2d"),
                    width: objectTileSize,
                    height: objectTileSize,
                    image: player2Image,
                    numberOfFrames: 1
                }).render(index, false);
                break;

            case '@3':
                sprite({
                    context: canvas.getContext("2d"),
                    width: objectTileSize,
                    height: objectTileSize,
                    image: player3Image,
                    numberOfFrames: 1
                }).render(index, false);
                break;
            case '@4':
                sprite({
                    context: canvas.getContext("2d"),
                    width: objectTileSize,
                    height: objectTileSize,
                    image: player4Image,
                    numberOfFrames: 1
                }).render(index, false);
                break;

            case '[]':
                sprite({
                    context: canvas.getContext("2d"),
                    width: objectTileSize,
                    height: objectTileSize,
                    image: beerImage,
                    numberOfFrames: 1
                }).render(index, false);

                break;
            default:

                break;

        }
    }

    function renderObject(index, options, clear) {

        if(index < 0 || index > game.board.tiles) return;

        var objectTile;
        clear = typeof clear !== 'undefined' ? clear : true;

        if(objectTiles[index]) {
            objectTile = objectTiles[index];
        } else {
            objectTile = sprite(options);
            objectTiles[index] = objectTile;
        }

        objectTile.render(index, clear);

    }

    function renderGround(index) {

        if(index < 0 || index > game.board.tiles) return;

        if(groundTiles[index]) {
            var tile = groundTiles[index];
            tile.render(index);
        } else {
            
            var ground = sprite({
                context: canvas.getContext("2d"),
                width: groundTileSize,
                height: groundTileSize,
                image: groundImage,
                spriteLine: 5,
                numberOfFrames: 1
            });
            ground.render(index);

            groundTiles[index] = ground;
        }
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
            //redraw the ground for this tile
            renderGround(tileIndex);
        }

        that.render = function (tileIndex, clear) {
            var coords = indexToCoordinates(tileIndex);
            var x = coords.x;
            var y = coords.y;

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
                x*groundTileSize-((that.width-groundTileSize)/2),
                //Destination y
                y*groundTileSize-(that.height-groundTileSize),
                //Destination width
                that.width,
                //Destination height
                that.height);
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
