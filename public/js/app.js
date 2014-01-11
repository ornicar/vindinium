$(function() {
    $(window).load(function() {

        var CURRENTPOS = 0;
        var POSITIONS = [];

        function updateGame(pos) {
            drawPosition(POSITIONS[pos]);
            $('#turn > span').text(Math.floor(pos / 4));
        }

        // nav
        $('#nav').show();
        $('#prev').click(function(e) {
            if (CURRENTPOS > 0) {
                CURRENTPOS--;
                updateGame(CURRENTPOS);
            }
        });
        $('#next').click(function(e) {
            if (CURRENTPOS < POSITIONS.length - 1) {
                CURRENTPOS++;
                updateGame(CURRENTPOS);
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

        // if replay is loaded in global object it means game is over
        // else let's receive events and play them
        if (replay) {
            POSITIONS = replay.games
            updateGame(CURRENTPOS);
        } else {
            var source = new EventSource("/events/" + gameId);
            source.addEventListener('message', function(e) {
                var game = JSON.parse(e.data);
                POSITIONS.push(game);

                updateGame(CURRENTPOS);
                CURRENTPOS++;

                console.log(CURRENTPOS);

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
        }
    });
});
