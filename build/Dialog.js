(function (win) {

  win.Dialog = React.createClass({
    displayName: "Dialog",

    render: function () {
      return React.createElement(
        "div",
        { id: "dialog", className: "dialog_" + this.props.type, onClick: this.props.onClear },
        this.props.message
      );
    }
  });
})(window);