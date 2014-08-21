/** @jsx React.DOM */
var React = require("react");
var GameModel = require("../../GameModel");

var TurnCount = React.createClass({
  propTypes: {
    game: React.PropTypes.instanceOf(GameModel).isRequired
  },
  render: function(){
    var game = this.props.game;
    // var number = Math.floor((game.turn+ 1) / 4) + '/' + Math.ceil(game.maxTurns/4);
    var number = (game.turn) + '/' + game.maxTurns;
    return <div className="turn-count">
      <div className="legend">
        <strong>Turn</strong>
        <span className="number">{number}</span>
      </div>
    </div>;
  }
});
module.exports = TurnCount;
