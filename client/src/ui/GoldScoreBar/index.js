/** @jsx React.DOM */
var React = require("react");
var GameModel = require("../../GameModel");

var GoldScoreBar = React.createClass({
  propTypes: {
    game: React.PropTypes.instanceOf(GameModel).isRequired,
    height: React.PropTypes.number.isRequired
  },
  render: function(){
    var sum = this.props.game.heroes.reduce(function (sum, hero) {
      return sum + hero.gold;
    }, 0);
    return <div className="gold-score-bar">
      <div className="gold-score-bar-coin">
        <img src="/assets/img/ui/coin.png" className="coin" />
      </div>
      <div className="bars" style={{ height: (this.props.height - 30 + 14)+"px" }}>
      {
        this.props.game.heroes.map(function (hero, i) {
          var height = sum===0 ? "25%" : (100 * hero.gold / sum).toFixed(2)+"%";
          return <div key={hero.id} className={"player player-"+(i+1)} style={{ height: height }}></div>;
        })
      }
      </div>
    </div>;
  }
});
module.exports = GoldScoreBar;
