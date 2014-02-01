$(function() {
    $(window).load(function() {

        var CURRENTPOS = 0;
        var POSITIONS = [];
        var $turn = $('#turn span.number');
        var $replayRange = $('#replayRange');
        var maxTurns = -1;

        function updateGame(pos) {
            var game = POSITIONS[pos];

            if(maxTurns == -1) {
                maxTurns = game['maxTurns'];
                $replayRange.attr('max', maxTurns);
            }
            drawPosition(game);
            $replayRange.val(pos);
            $turn.text(Math.floor((game['turn'] + 1) / 4) + '/' + Math.ceil(maxTurns/4));
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

	$(document).keydown(function(e) {
	    if(e.keyCode == 39) { //Right Arrow
		$('#next').click();
	    }else if(e.keyCode == 37) { //Left Arrow
                $('#prev').click();
	    }
	});

        //Replay
        //
        $("#replayRange").change(function() {
            CURRENTPOS = $(this).val();
            updateGame(CURRENTPOS);
        });

        var throttledUpdateGame = _.throttle(function(pos) {
          updateGame(pos);
        }, 100);

        var source = new EventSource("/events/" + gameId);
        source.addEventListener('message', function(e) {
            POSITIONS.push(JSON.parse(e.data));
            throttledUpdateGame(CURRENTPOS);
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
