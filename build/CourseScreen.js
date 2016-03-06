(function (win) {

  var invalidity = {
    invalidTitle: false
  };

  win.CourseScreen = React.createClass({
    displayName: "CourseScreen",

    getInitialState: function () {
      return Object.assign({}, invalidity, this.props.course);
    },
    componentWillReceiveProps: function (nextProps) {
      this.setState(Object.assign({}, invalidity, nextProps.course));
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
        type: "REQUEST_SELECT_ENTRIES",
        value: this.props.course.id
      });
    },
    onDo: function () {
      this.props.store.dispatch({
        type: "REQUEST_DO_COURSE",
        value: this.props.course.id
      });
    },
    render: function () {
      var title = this.props.course.id ? "Edit van course " + this.props.course.title : "Maken van course";
      var deleteButton = this.props.course.id ? React.createElement(
        "button",
        { onClick: this.onDelete },
        "Delete"
      ) : "";
      return React.createElement(
        "div",
        null,
        React.createElement(
          "h3",
          null,
          title
        ),
        React.createElement("input", { autoFocus: true, required: true, type: "text", onChange: this.onTitleInputChange,
          value: this.state.title }),
        React.createElement(
          "button",
          { disabled: !!!this.state.title, onClick: this.onSave },
          "Save"
        ),
        React.createElement(
          "button",
          { onClick: this.props.onMain },
          "Back"
        ),
        React.createElement(
          "button",
          { disabled: !this.props.course.id, onClick: this.onEntries },
          "Show entries"
        ),
        React.createElement(
          "button",
          { disabled: this.props.course.count < 5, onClick: this.onDo },
          "Do"
        ),
        deleteButton
      );
    }
  });
})(window);