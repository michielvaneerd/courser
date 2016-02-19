(function(win) {

  var emptyEntry = {
    id : 0,
    src : "",
    dest : ""
  };

  win.EntriesScreen = React.createClass({
    getInitialState : function() {
      return Object.assign({}, emptyEntry, this.props.entry);
    },
    componentWillReceiveProps : function(nextProps) {
      this.setState(Object.assign({}, emptyEntry, nextProps.entry));
    },
    onSave : function() {
      this.props.store.dispatch({
        type : "REQUEST_SAVE_ENTRY",
        value : this.state
      });
    },
    onSrcChange : function(e) {
      this.setState({src : e.target.value});
    },
    onDestChange : function(e) {
      this.setState({dest : e.target.value});
    },
    onActivate : function(e) {
      this.props.store.dispatch({
        type : "SELECT_ENTRY",
        value : e.currentTarget.dataset.id
      });
    },
    onBack : function() {
      this.props.store.dispatch({
        type : "SHOW_COURSE_SCREEN"
      });
    },
    onDelete : function() {
      this.props.store.dispatch({
        type : "REQUEST_DELETE_ENTRY"
      });
    },
    render : function() {
      var editOrCreateRow =
        <tr key={this.props.entry.id || 0}>
          <td><input type="text"
            onChange={this.onSrcChange}
            value={this.state.src} /></td>
          <td><input type="text"
            onChange={this.onDestChange}
            value={this.state.dest} /></td>
          <td>
            <button onClick={this.onSave}>Save</button>
            {this.props.entry.id
              ? <button onClick={this.onDelete}>Delete</button> : null}
          </td>
        </tr>
      return (
        <div>
          <table>
            <tbody>
              {Object.keys(this.props.entries).map(function(entryId) {
                var entry = this.props.entries[entryId];
                var row = this.props.entry.id == entryId
                  ?
                  editOrCreateRow
                  :
                  <tr onClick={this.onActivate} data-id={entryId} key={entryId}>
                    <td>{entry.src}</td>
                    <td>{entry.dest}</td>
                    <td></td>
                  </tr>
                return row;
              }, this)}
              {this.props.entry.id
                ? <tr><td></td><td></td><td></td></tr>
                : editOrCreateRow}
            </tbody>
          </table>
          <button onClick={this.onBack}>Back</button>
        </div>
      );
    }
  });

}(window));
