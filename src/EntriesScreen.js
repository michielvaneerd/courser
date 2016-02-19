(function(win) {

  win.EntriesScreen = React.createClass({
    getInitialState : function() {
      return {
        id : 0,
        src : "",
        dest : ""
      };
    },
    onSave : function() {
      this.props.store.dispatch({
        type : "REQUEST_SAVE_ENTRY",
        value : this.state
      });
      this.setState(this.getInitialState());
    },
    onSrcChange : function(e) {
      this.setState({src : e.target.value});
    },
    onDestChange : function(e) {
      this.setState({dest : e.target.value});
    },
    onActivate : function(e) {
      var entry = this.props.entries[e.currentTarget.dataset.id];
      this.setState(Object.assign({}, entry));
    },
    onBack : function() {
      this.props.store.dispatch({
        type : "SHOW_COURSE_SCREEN"
      });
    },
    render : function() {
      return (
        <div>
          <table>
            <tbody>
              {Object.keys(this.props.entries).map(function(entryId) {
                var entry = this.props.entries[entryId];
                var row = this.state.id == entryId
                  ?
                  <tr key={entryId}>
                    <td><input type="text"
                      onChange={this.onSrcChange}
                      value={this.state.src} /></td>
                    <td><input type="text"
                      onChange={this.onDestChange}
                      value={this.state.dest} /></td>
                    <td><button onClick={this.onSave}>Save</button></td>
                  </tr>
                  :
                  <tr onClick={this.onActivate} data-id={entryId} key={entryId}>
                    <td>{entry.src}</td>
                    <td>{entry.dest}</td>
                    <td></td>
                  </tr>
                return row;
              }, this)}
            </tbody>
          </table>
          <button onClick={this.onBack}>Back</button>
        </div>
      );
    }
  });

}(window));
