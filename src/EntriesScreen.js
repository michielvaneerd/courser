(function(win) {

  var invalidity = {
    invalidSrc : false,
    invalidDest : false
  };

  var emptyEntry = {
    id : 0,
    source : "",
    destination : "",
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
        source : e.target.value
      });
    },
    onDestChange : function(e) {
      this.setState({
        invalidDest : e.target.value.length == 0,
        destination : e.target.value
      });
    },
    onPhoneChange : function(e) {
      this.setState({
        phone : e.target.value
      });
    },
    selectEntry : function(id) {
      this.props.store.dispatch({
        type : "SELECT_ENTRY",
        value : id,
        forceBackToMainScreen : this.props.forceBackToMainScreen
      });
    },
    onActivate : function(e) {
      this.selectEntry(e.currentTarget.dataset.id);
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
    onKeyDown : function(e) {
      switch (e.keyCode) {
        case 13: // ENTER
          e.preventDefault();
          if (this.state.source.length && this.state.destination.length) {
            this.onSave();
          }
        break;
        case 27: // ESC
          e.preventDefault();
          if (this.state.id) {
            this.onCancel();
          } else {
            this.onBack();
          }
        break;
        case 40: // DOWN
          e.preventDefault();
          if (this.state.id) {
            var ids = Object.keys(this.props.entries);
            var index = ids.indexOf(this.state.id.toString());
            if (index + 1 == ids.length) {
              this.onCancel();
            } else {
              this.selectEntry(ids[index + 1]);
            }
          }
        break;
        case 38: // UP
          e.preventDefault();
          var ids = Object.keys(this.props.entries);
          if (ids.length) {
            if (this.state.id) {
              var index = ids.indexOf(this.state.id.toString());
              if (index > 0) {
                this.selectEntry(ids[index - 1]);
              }
            } else {
              this.selectEntry(ids[ids.length - 1]);
            }
          }
        break;
      }
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
              if (el && !me.state.source.length && !me.state.destination.length
                && !me.state.phone.length)
              {
                el.focus();
              }
            }}
            onKeyDown={this.onKeyDown}
            required={!!this.props.entry.id || this.state.destination.length}
            onChange={this.onSrcChange}
            value={this.state.source} /></td>
          <td><input type="text"
            required={!!this.props.entry.id || this.state.source.length}
            onChange={this.onDestChange}
            onKeyDown={this.onKeyDown}
            value={this.state.destination} /></td>
          <td><input type="text"
            onChange={this.onPhoneChange}
            onKeyDown={this.onKeyDown}
            value={this.state.phone} /></td>
          <td>
            <div className="smallToolbar">
              <button disabled={!(this.state.source.length && this.state.destination.length)}
                onClick={this.onSave}>Save</button>
              {this.props.entry.id
                ? (
                    <span>
                      <button className="deleteButton" onClick={this.onDelete}>Delete</button>
                      <button onClick={this.onCancel}>Cancel</button>
                    </span>
                  ) : null}
            </div>
          </td>
        </tr>
      return (
        <div>
          <div className="toolbar topToolbar">
            <button onClick={this.props.onMain}>Back</button>
          </div>
          <h2>Entries of {this.props.course.title}</h2>
          <table>
            <thead>
              <tr>
                <th>{this.props.course.source_title}</th>
                <th>{this.props.course.destination_title}</th>
                <th>Pronunciation</th>
                <th>Test result</th>
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
                    <td>{entry.source}</td>
                    <td>{entry.destination}</td>
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
        </div>
      );
    }
  });

}(window));
