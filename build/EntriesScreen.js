(function (win) {

  win.EntriesScreen = React.createClass({
    displayName: "EntriesScreen",

    getInitialState: function () {
      return {
        id: 0,
        src: "",
        dest: ""
      };
    },
    onSave: function () {
      this.props.store.dispatch({
        type: "REQUEST_SAVE_ENTRY",
        value: this.state
      });
      this.setState(this.getInitialState());
    },
    onSrcChange: function (e) {
      this.setState({ src: e.target.value });
    },
    onDestChange: function (e) {
      this.setState({ dest: e.target.value });
    },
    onActivate: function (e) {
      var entry = this.props.entries[e.currentTarget.dataset.id];
      this.setState(Object.assign({}, entry));
    },
    onBack: function () {
      this.props.store.dispatch({
        type: "SHOW_COURSE_SCREEN"
      });
    },
    render: function () {
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
              var row = this.state.id == entryId ? React.createElement(
                "tr",
                { key: entryId },
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
                  )
                )
              ) : React.createElement(
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
            }, this)
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