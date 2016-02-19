(function (win) {

  win.CourseScreen = React.createClass({
    displayName: "CourseScreen",

    getInitialState: function () {
      return Object.assign({}, this.props.course);
    },
    onSave: function () {
      this.props.store.dispatch({
        type: "REQUEST_SAVE_COURSE",
        value: this.state
      });
    },
    onTitleInputChange: function (e) {
      this.setState({
        title: e.target.value
      });
    },
    onDelete: function () {
      this.props.store.dispatch({
        type: "REQUEST_DELETE_COURSE"
      });
    },
    onEntries: function () {
      this.props.store.dispatch({
        type: "SELECT_ENTRIES"
      });
    },
    render: function () {
      var title = this.props.course.id ? "Edit van course " + this.props.course.title : "Maken van course";
      return React.createElement(
        "div",
        null,
        React.createElement(
          "h3",
          null,
          title
        ),
        React.createElement("input", { type: "text", onChange: this.onTitleInputChange,
          value: this.state.title }),
        React.createElement(
          "button",
          { onClick: this.onSave },
          "Save"
        ),
        React.createElement(
          "button",
          { onClick: this.props.onMain },
          "Back"
        ),
        React.createElement(
          "button",
          { onClick: this.onEntries },
          "Show entries"
        ),
        React.createElement(
          "button",
          { onClick: this.onDelete },
          "Delete"
        )
      );
    }
  });
})(window);