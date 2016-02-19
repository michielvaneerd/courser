(function (win) {

  var emptyEntry = {
    id: 0,
    src: "",
    dest: ""
  };

  win.EntriesScreen = React.createClass({
    displayName: "EntriesScreen",

    getInitialState: function () {
      return Object.assign({}, emptyEntry, this.props.entry);
    },
    componentWillReceiveProps: function (nextProps) {
      this.setState(Object.assign({}, emptyEntry, nextProps.entry));
    },
    onSave: function () {
      this.props.store.dispatch({
        type: "REQUEST_SAVE_ENTRY",
        value: this.state
      });
    },
    onSrcChange: function (e) {
      this.setState({ src: e.target.value });
    },
    onDestChange: function (e) {
      this.setState({ dest: e.target.value });
    },
    onActivate: function (e) {
      this.props.store.dispatch({
        type: "SELECT_ENTRY",
        value: e.currentTarget.dataset.id
      });
    },
    onBack: function () {
      this.props.store.dispatch({
        type: "SHOW_COURSE_SCREEN"
      });
    },
    onDelete: function () {
      this.props.store.dispatch({
        type: "REQUEST_DELETE_ENTRY"
      });
    },
    render: function () {
      var editOrCreateRow = React.createElement(
        "tr",
        { key: this.props.entry.id || 0 },
        React.createElement(
          "td",
          null,
          React.createElement("input", { type: "text",
            onChange: this.onSrcChange,
            value: this.state.src })
        ),
        React.createElement(
          "td",
          null,
          React.createElement("input", { type: "text",
            onChange: this.onDestChange,
            value: this.state.dest })
        ),
        React.createElement(
          "td",
          null,
          React.createElement(
            "button",
            { onClick: this.onSave },
            "Save"
          ),
          this.props.entry.id ? React.createElement(
            "button",
            { onClick: this.onDelete },
            "Delete"
          ) : null
        )
      );
      return React.createElement(
        "div",
        null,
        React.createElement(
          "table",
          null,
          React.createElement(
            "tbody",
            null,
            Object.keys(this.props.entries).map(function (entryId) {
              var entry = this.props.entries[entryId];
              var row = this.props.entry.id == entryId ? editOrCreateRow : React.createElement(
                "tr",
                { onClick: this.onActivate, "data-id": entryId, key: entryId },
                React.createElement(
                  "td",
                  null,
                  entry.src
                ),
                React.createElement(
                  "td",
                  null,
                  entry.dest
                ),
                React.createElement("td", null)
              );
              return row;
            }, this),
            this.props.entry.id ? React.createElement(
              "tr",
              null,
              React.createElement("td", null),
              React.createElement("td", null),
              React.createElement("td", null)
            ) : editOrCreateRow
          )
        ),
        React.createElement(
          "button",
          { onClick: this.onBack },
          "Back"
        )
      );
    }
  });
})(window);