/** @jsx React.DOM */
var React = require("react");
var GameModel = require("./GameModel");
var GameBoardRender = require("./game/GameBoard");
var GoldScoreBar = require("./ui/GoldScoreBar");
var HeroStats = require("./ui/HeroStats");
var PlayControls = require("./ui/PlayControls");
var Live = require("./ui/Live");
var TurnCount = require("./ui/TurnCount");

var Game = React.createClass({
  propTypes: {
    game: React.PropTypes.instanceOf(GameModel).isRequired,
    refreshRate: React.PropTypes.number.isRequired,
    increaseSpeed: React.PropTypes.func,
    decreaseSpeed: React.PropTypes.func,
    play: React.PropTypes.func,
    pause: React.PropTypes.func,
    jump: React.PropTypes.func,
    playing: React.PropTypes.bool,
    buffered: React.PropTypes.number,
    withControls: React.PropTypes.bool,
    keyboardControls: React.PropTypes.bool,
    live: React.PropTypes.bool,
    map: React.PropTypes.string,
    debug: React.PropTypes.bool,
    quality: React.PropTypes.oneOf([1,2,3])
  },
  getDefaultProps: function () {
    return {
      map: "lowlands",
      debug: false,
      quality: 3,
      withControls: true,
      keyboardControls: true
    };
  },
  resetGameBoard: function () {
    if (this.boardRender) {
      this.boardRender.destroy();
    }
    this.boardRender = new GameBoardRender(this.refs.boardBox.getDOMNode(), this.props.map, this.props.debug, this.props.quality);
  },
  componentDidMount: function () {
    this.resetGameBoard();
    this.boardRender.setGame(this.props.game);
  },
  componentDidUnmount: function () {
    this.boardRender.destroy();
  },
  componentDidUpdate: function (prevProps) {
    if (prevProps.game.id !== this.props.game.id) {
      if (prevProps.game) prevProps.game.destroy();
      this.resetGameBoard();
      this.boardRender.setGame(this.props.game);
    }
    else if (prevProps.game.turn !== this.props.game.turn) {
      var interpolationTime =
        prevProps.game.turn !== this.props.game.turn-1 || // only do interpolation if the new game is a following turn
        this.props.refreshRate < 20 ? // too low interpolation is not significant
        0 : this.props.refreshRate;

      this.boardRender.setGame(this.props.game, interpolationTime);
    }
    if (prevProps.quality !== this.props.quality) {
      this.boardRender.setQuality(this.props.quality);
    }
  },
  render: function () {
    var game = this.props.game;
    var boardSize = this.boardRender && this.boardRender.getHeight() || 400;

    var refreshRate = this.props.refreshRate;
    var speed = refreshRate ? ""+Math.round(1000 / refreshRate) : "max";

    return <div className="game">
      {this.props.live ? <Live /> : ''}
      <div className="boardBox" ref="boardBox"></div>
      <GoldScoreBar game={game} height={boardSize} />
      <div className="infos">
        <TurnCount game={game} />
        <div className="heroes">
        {
          this.props.game.heroes.map(function (hero) {
            return <HeroStats key={hero.id} hero={hero} game={game} />;
          })
        }
        </div>
      </div>
      { this.props.withControls ?
      <PlayControls game={game} timeBarWidth={boardSize} speed={speed} increaseSpeed={this.props.increaseSpeed} decreaseSpeed={this.props.decreaseSpeed} play={this.props.play} pause={this.props.pause} jump={this.props.jump} keyboard={this.props.keyboardControls} playing={this.props.playing} buffered={this.props.buffered} />
      : ''}
    </div>;
  }
});

module.exports = Game;
