(function(win) {

  win.SuccessDialog = React.createClass({
    onClick : function() {
      this.props.store.dispatch({
        type : "SUCCESS"
      });
    },
    render : function() {
      return (
        <div id="successDialog" onClick={this.onClick}>
          {this.props.success}
        </div>
      );
    }
  });

}(window));