/** @jsx React.DOM */
var React = require("react");
var GameModel = require("../../GameModel");

var HeroStats = React.createClass({
  propTypes: {
    game: React.PropTypes.instanceOf(GameModel).isRequired,
    hero: React.PropTypes.object.isRequired
  },
  render: function(){
    var hero = this.props.hero;
    var first = this.props.game.getWinner() === hero.id;
    var cls = ["hero-stats"];
    if (first) cls.push("first");
    if (hero.crashed) cls.push("crashed");
    return <div className={cls.join(" ")}>
      <img className="cross" src="/assets/img/ui/cross.png" />
      <img className="player" src={"/assets/img/ui/player"+hero.id+".png"} />
      <img className="award" src="/assets/img/ui/award.png" />
      <div className="gold-wrapper">
        <span className="gold">{hero.gold}</span>
        <img src="/assets/img/ui/coin.png" className="coin" />
      </div>
      <a href={"/ai/"+hero.userId}>
        <span className="name" title={hero.name}>{hero.name}</span>
      </a>
      Elo: <span className="elo">{hero.elo}</span>
    </div>;
  }
});
module.exports = HeroStats;
