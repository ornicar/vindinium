$(function() {

  $('#manual-alone').click(function() {
    $.post('/api/training/alone', function(data) {
      location.href = "/" + data.game.id + '?playUrl=' + encodeURIComponent(data.playUrl);
    });
  });
  $('#manual-many').click(function() {
    $.get('/api/arena', function(data) {
      location.href = "/" + data.game.id + '?playUrl=' + encodeURIComponent(data.playUrl);
    });
    $(this).replaceWith('Waiting for other players...');
  });

  function getParameterByName(name) {
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  var url = getParameterByName('playUrl');
  if (!url) return;

  $(document).on('keypress keydown', function(e) {
    if (e.keyCode == 37) move('west');
    if (e.keyCode == 38) move('north');
    if (e.keyCode == 39) move('east');
    if (e.keyCode == 40) move('south');
    e.preventDefault();
  });

  var lock = false;

  function move(dir) {
    if (lock) {
      console.debug("Ignored move while locked");
    } else {
      $('#yourturn').text("");
      $.ajax({
        url: url,
        method: 'post',
        data: {
          dir: dir
        },
        success: function() {
          $('#yourturn').text("A TON TOUR");
          lock = false;
        }
      });
    }
    lock = true;
  }

});
