(function (win) {

  win.SuccessDialog = React.createClass({
    displayName: "SuccessDialog",

    onClick: function () {
      this.props.store.dispatch({
        type: "SUCCESS"
      });
    },
    render: function () {
      return React.createElement(
        "div",
        { id: "successDialog", onClick: this.onClick },
        this.props.success
      );
    }
  });
})(window);