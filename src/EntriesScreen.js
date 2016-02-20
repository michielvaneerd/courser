(function(win) {

  var invalidity = {
    invalidSrc : false,
    invalidDest : false
  };

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
      this.setState(Object.assign({}, invalidity, emptyEntry, nextProps.entry));
    },
    onSave : function() {
      var entry = Object.assign({}, this.state);
      Object.keys(invalidity).forEach(function(key) {
        delete entry[key];
      });
      this.props.store.dispatch({
        type : "REQUEST_SAVE_ENTRY",
        value : entry
      });
    },
    onSrcChange : function(e) {
      this.setState({
        invalidSrc : e.target.value.length == 0,
        src : e.target.value
      });
    },
    onDestChange : function(e) {
      this.setState({
        invalidDest : e.target.value.length == 0,
        dest : e.target.value
      });
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
    onCancel : function() {
      this.props.store.dispatch({
        type : "SELECT_ENTRY"
      });
    },
    render : function() {
      var editOrCreateRow =
        <tr key={this.props.entry.id || 0}>
          <td><input type="text"
            required={!!this.props.entry.id || this.state.dest.length}
            onChange={this.onSrcChange}
            value={this.state.src} /></td>
          <td><input type="text"
            required={!!this.props.entry.id || this.state.src.length}
            onChange={this.onDestChange}
            value={this.state.dest} /></td>
          <td>
            <button disabled={!(this.state.src.length && this.state.dest.length)}
              onClick={this.onSave}>Save</button>
            {this.props.entry.id
              ? (
                  <span>
                    <button onClick={this.onDelete}>Delete</button>
                    <button onClick={this.onCancel}>Cancel</button>
                  </span>
                ) : null}
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
