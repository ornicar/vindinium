var Url = require("url");
var Rx = require("rx");
var React = require("react");
var GameStream = require("./GameStream");
var Game = require("./Game");

var SPEEDS = [1, 2, 5, 10, 20, 50, 75, 100, 150, 200];
var DEFAULT_SPEED = 10;

var url = Url.parse(window.location.href, true);
var mount = document.getElementById("game");

function alwaysTrue () { return true; }
function increment (x) { return x + 1; }
function identity (x) { return x; }

function isNotEmptyArray (array) {
  return array.length > 0;
}

function runGame (gameId) {
  /// States ///
  var speed, refreshRate;
  var playing = false;
  var game = null;
  var buffered = 0;

  /// Streams ///

  // The game stream is cached once forever
  var gameStream = new Rx.ReplaySubject();
  GameStream(gameId).subscribe(gameStream);

  var gameInterruptions = new Rx.Subject();
  var refreshRateStream = Rx.Observable.generateWithRelativeTime(0, alwaysTrue, increment, identity, function () { return refreshRate; });

  // Functions
  function render () {
    if (!game) return; // Nothing to render yet
    React.renderComponent(Game({
      game: game,
      refreshRate: refreshRate,
      increaseSpeed: increaseSpeed,
      decreaseSpeed: decreaseSpeed,
      play: play,
      pause: pause,
      jump: jump,
      playing: playing,
      buffered: buffered,
      map: url.query.map
    }), mount);
    // sorry for the ugly hack! Where should that go?
    if (game.turn >= game.maxTurns && window.location.pathname === '/tv')
      setTimeout(function() { window.location.reload(); }, 2000);
  }

  function restart (startAtTurn) {
    playing = true;
    gameStream
      .skip(startAtTurn-1) // Jump at startAtTurn
      .zip(refreshRateStream, identity) // Schedule the game stream to the dynamic refreshRate
      .bufferWithTime(1000 / 60) // Throttle the game states to allow very fast play
      .takeUntil(gameInterruptions) // Stop once there is a game interruption (pause / jump)
      .filter(isNotEmptyArray) // Filter empty buffers
      .subscribe(function (g) {
        game = g[g.length-1]; // The most recent game in the buffer
        render();
      }, function (err) {
        console.error(err);
        playing = false;
        render();
      }, function () {
        playing = false;
        render();
      });
  }

  function setSpeed (s) {
    speed = s === "max" ? s : isNaN(s) ? DEFAULT_SPEED : parseInt(s, 10);
    refreshRate = speed==="max" ? 0 :  1000 / speed;
  }

  function increaseSpeed () {
    if (speed!=="max") {
      var i;
      for (i=0; i<SPEEDS.length && speed > SPEEDS[i]; ++i);
      setSpeed(i >= SPEEDS.length-1 ? "max" : SPEEDS[i+1]);
      render();
    }
  }

  function decreaseSpeed () {
    if (speed === "max") {
      setSpeed(SPEEDS[SPEEDS.length-1]);
    }
    else {
      var i;
      for (i=SPEEDS.length-1; i >= 0 && speed < SPEEDS[i]; --i);
      setSpeed(i<=0 ? SPEEDS[0] : SPEEDS[i-1]);
    }
    render();
  }

  function pause () {
    if (!playing) return;
    gameInterruptions.onNext("paused");
    render();
  }

  function play () {
    if (playing) return;
    restart(!game || game.turn-1 === game.maxTurns ? 1 : game.turn);
    render();
  }

  function jump (turn) {
    turn -= 1;
    if (turn < 0 || game && turn > game.maxTurns) return;
    gameInterruptions.onNext("jumped");
    gameStream
      .skip(turn)
      .first()
      .subscribe(function (g) {
        game = g;
        render();
      });
  }

  // Start the game
  setSpeed(url.query.speed);
  gameStream
    .subscribe(function (game) {
      buffered = game.turn;
    });
  play();
}

// The entry point
function main () {
  if (window.GAME_ID) runGame(window.GAME_ID);
}

main();
