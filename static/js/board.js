//Thanks to http://www.williammalone.com/articles/create-html5-canvas-javascript-sprite-animation/
jQuery( document ).ready(function( $ ) {
	var flask,
        flaskImage,
        boss,
        bossImage,
        canvas;	

    var tileSize = 32;
    var boardSize = 10;

    function gameLoop () {

        window.requestAnimationFrame(gameLoop);
        
        flask.update();
        flask.render(1,1);

        boss.update();
        boss.render(3,6);
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

        that.render = function (x, y) {
            // Clear the canvas
            that.context.clearRect(x*that.width, y*that.width, that.width, that.height);

            // Draw the animation
            that.context.drawImage(
            that.image,
            frameIndex * that.width,
            0,
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


    var canvas = document.getElementById("board");
    canvas.width = tileSize * boardSize;
    canvas.height = tileSize * boardSize;

    var flaskImage = new Image();
    flaskImage.src = "img/item-flask.png";
    // Start the game loop as soon as the sprite sheet is loaded
    flaskImage.addEventListener("load", gameLoop);

    var flask = sprite({
        context: canvas.getContext("2d"),
        width: tileSize,
        height: tileSize,
        image: flaskImage,
		numberOfFrames: 6,
		ticksPerFrame: 8
    });
    var bossImage = new Image();
    bossImage.src = "img/boss.png";

    var boss = sprite({
        context: canvas.getContext("2d"),
        width: tileSize,
        height: tileSize,
        image: bossImage,
		numberOfFrames: 6,
		ticksPerFrame: 8
    });
});
