$(function() {
    $(window).load(function() {

        var currentPos = 0;

        function updateGame(pos) {
            drawPosition(replay.games[pos]);
            $('#turn > span').text(Math.floor(pos / 4));
        }

        // game
        currentPos = replay.games.length -1;
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

        var source = new EventSource("/events/" + replay.id);
        source.addEventListener('message', function(e) {
            var data = JSON.parse(e.data);
            replay.games.push(data);
            // update nav pos only if game was on last turn before new frame
            if (currentPos == replay.games.length - 2) {
                currentPos = replay.games.length - 1;
                updateGame(currentPos);
            }
        });
        source.addEventListener('open', function(e) {
            // Connection was opened.
            console.log("connection opened");
        }, false);
        source.addEventListener('error', function(e) {
            if (e.readyState == EventSource.CLOSED) {
                // Connection was closed.
                console.log("connection closed");
            }
        }, false);
    });
});
