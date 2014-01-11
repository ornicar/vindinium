$(function() {
    $(window).load(function() {

        var currentPos = 0;

        function updateGame(pos) {
            drawPosition(replay.games[pos]);
            $('#turn > span').text(Math.floor(pos / 4));
        }

        // game
        updateGame(currentPos);

        // nav
        $('#nav').show();
        $('#prev').click(function(e) {
            if (currentPos > 0) {
                currentPos--;
                updateGame(currentPos);
            }
        });
        $('#next').click(function(e) {
            if (currentPos < replay.games.length - 1) {
                currentPos++;
                updateGame(currentPos);
            }
        });
        $('#board').mousewheel(function(event) {
            if (event.deltaY == -1) {
                $('#next').click();
            } else if (event.deltaY == 1) {
                $('#prev').click();
            }
            event.stopPropagation();
            return false;
        });
    });
});
