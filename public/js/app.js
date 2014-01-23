$(function() {
    $(window).load(function() {

        var CURRENTPOS = 0;
        var POSITIONS = [];
        var $turn = $('#turn span.number');

        function updateGame(pos) {
            var game = POSITIONS[pos];
            drawPosition(game);
            $turn.text(Math.floor((game['turn'] + 1) / 4) + '/' + Math.ceil(game['maxTurns']/4));
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

        var debouncedUpdateGame = _.debounce(function(pos) {
          updateGame(pos);
        }, 20);

        var source = new EventSource("/events/" + gameId);
        source.addEventListener('message', function(e) {
            POSITIONS.push(JSON.parse(e.data));
            debouncedUpdateGame(CURRENTPOS);
            // updateGame(CURRENTPOS);
            CURRENTPOS++;
        });
        source.addEventListener('open', function(e) {
            // Connection was opened.
        }, false);
        source.addEventListener('error', function(e) {
            source.close();
            if (e.readyState == EventSource.CLOSED) {
                // Connection was closed.
            }
        }, false);
    });
});
