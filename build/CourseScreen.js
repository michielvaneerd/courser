(function (win) {

  var invalidity = {
    invalidTitle: false
  };

  win.CourseScreen = React.createClass({
    displayName: "CourseScreen",

    getInitialState: function () {
      return Object.assign({}, invalidity, this.props.course);
    },
    onSave: function () {
      var course = Object.assign({}, this.state);
      Object.keys(invalidity).forEach(function (key) {
        delete course[key];
      });
      this.props.store.dispatch({
        type: "REQUEST_SAVE_COURSE",
        value: course
      });
    },
    onTitleInputChange: function (e) {
      this.setState({
        title: e.target.value,
        invalidTitle: e.target.value.length == 0
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
        React.createElement("input", { required: true, type: "text", onChange: this.onTitleInputChange,
          value: this.state.title }),
        React.createElement(
          "button",
          { disabled: this.state.invalidTitle, onClick: this.onSave },
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