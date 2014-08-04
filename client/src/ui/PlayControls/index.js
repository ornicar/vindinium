/** @jsx React.DOM */
var React = require("react");
var GameModel = require("../../GameModel");
var Button = require("../Button");

var PlayControls = React.createClass({
  propTypes: {
    game: React.PropTypes.instanceOf(GameModel).isRequired,
    timeBarWidth: React.PropTypes.number.isRequired,
    speed: React.PropTypes.string.isRequired,
    increaseSpeed: React.PropTypes.func.isRequired,
    decreaseSpeed: React.PropTypes.func.isRequired,
    play: React.PropTypes.func.isRequired,
    pause: React.PropTypes.func.isRequired,
    jump: React.PropTypes.func.isRequired,
    keyboard: React.PropTypes.bool,
    playing: React.PropTypes.bool,
    buffered: React.PropTypes.number
  },
  getDefaultProps: function () {
    return {
      keyboard: true
    };
  },
  percentage: function (x, max) {
    return (100 * x / max).toFixed(2) + "%";
  },
  componentDidMount: function () {
    if (this.props.keyboard)
      document.addEventListener("keydown", this._keyboardBinding=this.onKeyDown.bind(this), false);
  },
  componentWillUnmount: function () {
    if (this._keyboardBinding)
      document.removeEventListener("keydown", this._keyboardBinding);
  },
  onKeyDown: function (e) {
    switch (e.which) {
      case 32:
        if (this.props.playing)
          this.props.pause();
        else
          this.props.play();
        e.preventDefault();
        break;
      case 37: // left
        this.props.pause();
        this.props.jump(this.props.game.turn - 1);
        e.preventDefault();
        break;
      case 39: // right
        this.props.pause();
        this.props.jump(this.props.game.turn + 1);
        e.preventDefault();
        break;
      case 38: // up
        this.props.increaseSpeed();
        e.preventDefault();
        break;
      case 40: // down
        this.props.decreaseSpeed();
        e.preventDefault();
        break;
    }
  },
  onTimeBarMouseDown: function (e) {
    this.startDragging();
    this.moveCursor(e);
  },
  onTimeBarMouseMove: function (e) {
    if (this._down)
      this.moveCursor(e);
  },
  onTimeBarMouseUp: function (e) {
    if (this._down) {
      this.moveCursor(e);
      this.stopDragging();
    }
  },
  onTimeBarMouseOut: function () {
    if (this._down)
      this.stopDragging();
  },
  startDragging: function () {
    this._down = true;
    this._playingWhenStartDrag = this.props.playing;
    this.props.pause();
  },
  stopDragging: function () {
    if (this._playingWhenStartDrag) {
      this.props.play();
    }
    this._down = false;
  },
  moveCursor: function (e) {
    var rect = e.target.getBoundingClientRect();
    var turn = Math.max(
      0, 
      Math.min(Math.floor(this.props.game.maxTurns * (e.clientX - rect.left) / rect.width),
      this.props.buffered
    ));
    if (this.props.game.turn !== turn)
      this.props.jump(turn);
  },
  render: function () {
    var maxTurns = this.props.game.maxTurns;
    var current = this.props.game.turn;
    var buffered = this.props.buffered;
    var playing = this.props.playing;
    return <div className="play-controls">
      <div className="play-pause">
      {
        playing ?
          <Button onClick={this.props.pause}><i className="fa fa-pause" /></Button> :
          <Button onClick={this.props.play}><i className="fa fa-play" /></Button>
      }
      </div>
      <div className="time-bar" style={{ width: this.props.timeBarWidth+"px" }}>
        <div className="time-bar-overlay" onMouseDown={this.onTimeBarMouseDown} onMouseMove={this.onTimeBarMouseMove} onMouseUp={this.onTimeBarMouseUp} onMouseOut={this.onTimeBarMouseOut}></div>
        <div className="full"></div>
        <div className="buffered" style={{ width: this.percentage(buffered, maxTurns) }}></div>
        <div className="elapsed" style={{ width: this.percentage(current, maxTurns) }}></div>
        <div className="cursor" style={{ left: this.percentage(current, maxTurns) }}></div>
      </div>
      <div className="speed-controls">
        <div className="action">
          <Button className="up" onClick={this.props.increaseSpeed}>+</Button>
          <span className="speed">{this.props.speed}</span>
          <Button className="down" onClick={this.props.decreaseSpeed}>-</Button>
        </div>
        <span className="legend">speed</span>
      </div>
    </div>;
  }
});
module.exports = PlayControls;
