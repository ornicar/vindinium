/** @jsx React.DOM */
var React = require("react");
var GameModel = require("./GameModel");
var GameBoardRender = require("./game/GameBoardRender");
var GoldScoreBar = require("./ui/GoldScoreBar");
var HeroStats = require("./ui/HeroStats");
var PlayControls = require("./ui/PlayControls");
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
    keyboardControls: React.PropTypes.bool
  },
  componentDidMount: function () {
    this.boardRender = new GameBoardRender(this.refs.boardBox.getDOMNode());
    this.boardRender.setGame(this.props.game);
  },
  componentDidUnmount: function () {
    this.boardRender.destroy();
  },
  componentDidUpdate: function (prevProps) {
    if (prevProps.game.turn !== this.props.game.turn) {
      this.boardRender.setGame(this.props.game, this.props.refreshRate);
    }
  },
  render: function () {
    var game = this.props.game;
    var boardSize = this.boardRender && this.boardRender.getHeight() || 400;

    var refreshRate = this.props.refreshRate;
    var speed = refreshRate ? ""+Math.round(1000 / refreshRate) : "max";

    return <div className="game">
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
      <PlayControls game={game} timeBarWidth={boardSize} speed={speed} increaseSpeed={this.props.increaseSpeed} decreaseSpeed={this.props.decreaseSpeed} play={this.props.play} pause={this.props.pause} jump={this.props.jump} keyboard={this.props.keyboardControls} playing={this.props.playing} buffered={this.props.buffered} />
    </div>;
  }
});

module.exports = Game;
