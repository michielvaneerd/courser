(function(win) {

  win.Dialog = React.createClass({
    render : function() {
      return (
        <div id="dialog" className={"dialog_" + this.props.type} onClick={this.props.onClear}>
          {this.props.message}
        </div>
      );
    }
  });

}(window));