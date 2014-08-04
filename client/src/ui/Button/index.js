/** @jsx React.DOM */
var React = require("react");

var Button = React.createClass({
  propTypes: {
    onClick: React.PropTypes.func.isRequired
  },
  render: function () {
    return this.transferPropsTo(
      <span className={(this.props.className||"")+" button"}>
      {this.props.children}
      </span>
    );
  }
});

module.exports = Button;
