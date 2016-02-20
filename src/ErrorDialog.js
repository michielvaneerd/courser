(function(win) {

  win.ErrorDialog = React.createClass({
    onClick : function() {
      this.props.store.dispatch({
        type : "ERROR"
      });
    },
    render : function() {
      return (
        <div id="errorDialog" onClick={this.onClick}>
          {this.props.error}
        </div>
      );
    }
  });

}(window));
