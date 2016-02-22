(function (win) {

  win.DoCourseScreen = React.createClass({
    displayName: "DoCourseScreen",

    getEntry: function (entries) {
      for (var key in entries) {
        if (!entries[key].attempt_success) {
          return entries[key];
        }
      }
      return {};
    },
    getInitialState: function () {
      return Object.assign({ id: 0, answer: "" }, this.getEntry(this.props.entries));
    },
    componentWillReceiveProps: function (nextProps) {
      this.setState(Object.assign({ id: 0, answer: "" }, this.getEntry(nextProps.entries)));
    },
    onSave: function () {
      if (this.state.answer != this.state.dest) {
        this.props.store.dispatch({
          type: "ERROR",
          value: "Wrong answer"
        });
        return;
      }
      var entry = Object.assign({}, this.state);
      delete entry.answer;
      this.props.store.dispatch({
        type: "REQUEST_SAVE_ANSWER",
        value: entry
      });
    },
    onChange: function (e) {
      this.setState({ answer: e.target.value });
    },
    onBack: function () {
      this.props.store.dispatch({
        type: "SHOW_COURSE_SCREEN"
      });
    },
    render: function () {
      var editArea = this.state.id ? React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          null,
          this.state.src
        ),
        React.createElement("input", { type: "text", onChange: this.onChange, value: this.state.answer }),
        React.createElement(
          "button",
          { onClick: this.onSave },
          "Save"
        )
      ) : React.createElement(
        "div",
        null,
        "Course finished!"
      );
      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          null,
          this.props.course.title
        ),
        editArea,
        React.createElement(
          "button",
          { onClick: this.onBack },
          "Back"
        )
      );
    }
  });
})(window);