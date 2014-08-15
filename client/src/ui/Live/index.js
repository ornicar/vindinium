/** @jsx React.DOM */
var React = require("react");

var Live = React.createClass({
  render: function () {
    return <span className="live">
      <i className="fa fa-circle"></i>&nbsp;Live
    </span>;
  }
});

module.exports = Live;
