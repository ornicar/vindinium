var Rx = require("rx");
var EventSource = window.EventSource;

module.exports = function EventSourceObservable (url) {
  return Rx.Observable.create(function (observer) {
    console.log("CREATING AN EventSource("+url+")");
    var source = new EventSource(url);
    source.addEventListener("message", function (e) {
      observer.onNext(JSON.parse(e.data));
    }, false);
    source.addEventListener('error', function () {
      source.close();
      if (source.readyState === EventSource.CLOSED) {
        observer.onCompleted();
      }
    }, false);
  });
};
