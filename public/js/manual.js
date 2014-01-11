$(function() {

  $('#manual').click(function() {
    $.get('/api/training/alone', function(data) {
      location.href = "/" + data.game.id + '?playUrl=' + encodeURIComponent(data.playUrl);
    });
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
    if (!lock) $.ajax({
      url: url,
      method: 'post',
      data: { dir: dir },
      success: function() {
        lock = false;
      }
    });
    lock = true;
  }

});
