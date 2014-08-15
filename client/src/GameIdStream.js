var EventSourceObservable = require("./network/EventSourceObservable");
var Rx = require("rx");

function GameIdStream (ai) {
  return EventSourceObservable(ai ? "/ai/"+ai+"/now-playing" : "/now-playing")
    .flatMap(function (ids) {
      return Rx.Observable.fromArray(ids);
    })
    .distinct();
}

module.exports = GameIdStream;
