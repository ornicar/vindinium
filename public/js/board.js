//Thanks to http://www.williammalone.com/articles/create-html5-canvas-javascript-sprite-animation/
jQuery( document ).ready(function( $ ) {

    /**
    var map = ['  ', 'XX', 'XX', '  ', 
               '  ', 'XX', 'XX', '  ',
               '  ', '$-', 'XX', '@1',
               '[]', '  ', '  ', '  '];
               **/
    var game = {"id":"wkbfki","turn":0,"heroes":[{"id":1,"name":"Alaric","pos":[0,1],"life":100,"gold":0},{"id":2,"name":"Luther","pos":[9,1],"life":100,"gold":0},{"id":3,"name":"Thorfinn","pos":[9,8],"life":100,"gold":0},{"id":4,"name":"York","pos":[0,8],"life":100,"gold":0}],"board":{"size":10,"tiles":["##","@1","  ","  ","##","##","  ","  ","@4","##","  ","  ","  ","##","##","##","##","  ","  ","  ","  ","  ","  ","  ","##","##","  ","  ","  ","  ","  ","  ","[]","  ","  ","  ","  ","[]","  ","  ","$-","  ","  ","##","  ","  ","##","  ","  ","$-","$-","  ","  ","##","  ","  ","##","  ","  ","$-","  ","  ","[]","  ","  ","  ","  ","[]","  ","  ","  ","  ","  ","  ","##","##","  ","  ","  ","  ","  ","  ","  ","##","##","##","##","  ","  ","  ","##","@2","  ","  ","##","##","  ","  ","@3","##"]}}

    //Should be
    /**
+--------------------+
|##@1    ####    @4##|
|      ########      |
|        ####        |
|    []        []    |
|$-    ##    ##    $-|
|$-    ##    ##    $-|
|    []        []    |
|        ####        |
|      ########      |
|##@2    ####    @3##|
+--------------------+
**/


    var groundTiles = [];

	var flask,
        flaskImage,
        groundImage,
        canvas;	

    var tileSize = 32;
    var boardSize = game.board.size;

    var canvas = document.getElementById("board");
    canvas.width = tileSize * boardSize;
    canvas.height = tileSize * boardSize;

    var groundImage = new Image();
    groundImage.src = "img/tilesets/plowed_soil.png";
    // Start the game loop as soon as the sprite sheet is loaded
    groundImage.addEventListener("load", gameLoop);

    var grassImage = new Image();
    grassImage.src = "img/tilesets/tallgrass.png";

    var goblinImage = new Image();
    goblinImage.src = "img/goblin.png";

    var flaskImage = new Image();
    flaskImage.src = "img/item-flask.png";

    var flask = sprite({
        context: canvas.getContext("2d"),
        width: tileSize,
        height: tileSize,
        image: flaskImage,
		numberOfFrames: 6,
		ticksPerFrame: 8
    });

    $(game.board.tiles).each(function( index ) {
        renderTile(index);
    });

    function renderTile(index) {
        value = game.board.tiles[index];
        console.log(value);
        switch (value) {
            case 'XX':
                if(groundTiles[index]) {
                    var tile = groundTiles[index];
                    tile.render(index);
                } else {
                    
                    var ground = sprite({
                        context: canvas.getContext("2d"),
                        width: tileSize,
                        height: tileSize,
                        image: groundImage,
                        spriteLine: 5,
                        numberOfFrames: 1
                    });
                    ground.render(index);

                    groundTiles[index] = ground;
                    

                    var wall = sprite({
                        context: canvas.getContext("2d"),
                        width: tileSize,
                        height: tileSize,
                        image: grassImage,
                        spriteLine: 5,
                        spriteColumn: 2,
                        numberOfFrames: 1
                    });
                    wall.render(index, false);
                }
                break;


            case '$-':
                if(groundTiles[index]) {
                    var tile = groundTiles[index];
                    tile.render(index);
                } else {
                    
                    var ground = sprite({
                        context: canvas.getContext("2d"),
                        width: tileSize,
                        height: tileSize,
                        image: groundImage,
                        spriteLine: 5,
                        numberOfFrames: 1
                    });
                    ground.render(index);

                    groundTiles[index] = ground;

                    var goblin = sprite({
                        context: canvas.getContext("2d"),
                        width: tileSize,
                        height: tileSize,
                        image: goblinImage,
                        numberOfFrames: 1
                    });
                    goblin.render(index, false);
                }
                break;

            case '  ':
            default:

                if(groundTiles[index]) {
                    var tile = groundTiles[index];
                    tile.render(index);
                } else {
                    var tile = sprite({
                        context: canvas.getContext("2d"),
                        width: tileSize,
                        height: tileSize,
                        image: groundImage,
                        spriteLine: 5,
                        numberOfFrames: 1
                    });
                    tile.render(index);

                }
                break;

        }
    }

    function indexToCoordinates(index) {
        var xValue = index % boardSize;
        var yValue = Math.floor(index / boardSize);

        return {x: xValue, y: yValue};
    }

    function gameLoop () {

        window.requestAnimationFrame(gameLoop);

        //flask.update();
        //flask.render(5);

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

        that.render = function (tileIndex, clear) {
            var coords = indexToCoordinates(tileIndex);
            var x = coords.x;
            var y = coords.y;

            var clear = typeof clear !== 'undefined' ? clear : true;

            if(clear) {
                // Clear the canvas
                that.context.clearRect(x*that.width, y*that.width, that.width, that.height);
            }

            // Draw the animation
            that.context.drawImage(
            that.image,
            that.spriteColumn*that.width + frameIndex * that.width,
            that.spriteLine*that.height,
            that.width,
            that.height,
            x*that.width,
            y*that.width,
            that.width,
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
