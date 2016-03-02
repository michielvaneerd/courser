(function(win) {

  var invalidity = {
    invalidSrc : false,
    invalidDest : false
  };

  var emptyEntry = {
    id : 0,
    src : "",
    dest : "",
    phone : "",
    attempt_success : 0,
    attempt_failure : 0
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
        value : entry,
        forceBackToMainScreen : this.props.forceBackToMainScreen
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
    onPhoneChange : function(e) {
      this.setState({
        phone : e.target.value
      });
    },
    onActivate : function(e) {
      this.props.store.dispatch({
        type : "SELECT_ENTRY",
        value : e.currentTarget.dataset.id,
        forceBackToMainScreen : this.props.forceBackToMainScreen
      });
    },
    onBack : function() {
      if (!this.props.forceBackToMainScreen) {
        this.props.store.dispatch({
          type : "SHOW_COURSE_SCREEN"
        });
      } else {
        this.props.onMain();
      }
    },
    onDelete : function() {
      this.props.store.dispatch({
        type : "REQUEST_DELETE_ENTRY",
        forceBackToMainScreen : this.props.forceBackToMainScreen
      });
    },
    onCancel : function() {
      this.props.store.dispatch({
        type : "SELECT_ENTRY",
        forceBackToMainScreen : this.props.forceBackToMainScreen
      });
    },
    render : function() {
      var me = this;
      var editOrCreateRow =
        <tr key={this.props.entry.id || 0}>
          <td><input type="text"
            autoFocus={true}
            ref={function(el) {
              // autofocus does not work after saving a new item...
              // not sure why
              if (el && !me.state.src.length && !me.state.dest.length
                && !me.state.phone.length)
              {
                el.focus();
              }
            }}
            required={!!this.props.entry.id || this.state.dest.length}
            onChange={this.onSrcChange}
            value={this.state.src} /></td>
          <td><input type="text"
            required={!!this.props.entry.id || this.state.src.length}
            onChange={this.onDestChange}
            value={this.state.dest} /></td>
          <td><input type="text"
            onChange={this.onPhoneChange}
            value={this.state.phone} /></td>
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
            <thead>
              <tr>
                <th>Source</th>
                <th>Destination</th>
                <th>Phonetic</th>
                <th></th>
              </tr>
            </thead>
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
                    <td>{entry.phone}</td>
                    <td>{entry.attempt_success} / {entry.attempt_failure}</td>
                  </tr>
                return row;
              }, this)}
              {this.props.entry.id
                ? <tr><td></td><td></td><td></td><td></td></tr>
                : editOrCreateRow}
            </tbody>
          </table>
          <button onClick={this.onBack}>Back</button>
        </div>
      );
    }
  });

}(window));
