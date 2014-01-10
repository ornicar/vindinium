$(function() {
    $(window).load(function() {
        var currentPos = 0;
        drawPosition(replay.games[currentPos]);
        $('#nav').show();
        $('#prev').click(function(e) {
            if (currentPos > 0) {
                currentPos--;
                drawPosition(replay.games[currentPos]);
            }
        });
        $('#next').click(function(e) {
            if (currentPos < replay.games.length - 1) {
                currentPos++;
                drawPosition(replay.games[currentPos])
            }
        });

    });
});
