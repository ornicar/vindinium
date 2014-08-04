var EventSourceObservable = require("./network/EventSourceObservable");
var GameModel = require("./GameModel");

// Server have a bug with positions: x and y are reversed
function reverseXY (pos) {
  return { x: pos.y, y: pos.x };
}
function bugfixServerPosition (game) {
  game.heroes.forEach(function (hero) {
    hero.pos = reverseXY(hero.pos);
    hero.spawnPos = reverseXY(hero.spawnPos);
  });
  return game;
}

function toGameClass (game) {
  return new GameModel(game);
}

function GameStream (id) {
  return EventSourceObservable("/events/"+id)
    .map(bugfixServerPosition)
    .map(toGameClass);
}

module.exports = GameStream;
