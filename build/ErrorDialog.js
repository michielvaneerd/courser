(function (win) {

  win.ErrorDialog = React.createClass({
    displayName: "ErrorDialog",

    onClick: function () {
      this.props.store.dispatch({
        type: "ERROR"
      });
    },
    render: function () {
      return React.createElement(
        "div",
        { id: "errorDialog", onClick: this.onClick },
        this.props.error
      );
    }
  });
})(window);