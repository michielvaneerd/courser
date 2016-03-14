(function (win) {

  var invalidity = {
    invalidTitle: false
  };

  win.CourseScreen = React.createClass({
    displayName: "CourseScreen",

    getInitialState: function () {
      return Object.assign({
        source_title: "Source",
        destination_title: "Destination",
        test_ok_success_count: 1,
        title: ""
      }, invalidity, this.props.course);
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
    onTestTypeChange: function (e) {
      var o = {};
      var key = e.currentTarget.dataset.id;
      var checked = e.currentTarget.checked;
      o[key] = checked;
      this.setState(o);
    },
    onDelete: function () {
      this.props.store.dispatch({
        type: "REQUEST_DELETE_COURSE"
      });
    },
    onTestOkSuccessCountChange: function (e) {
      this.setState({
        test_ok_success_count: e.target.value
      });
    },
    onSourceTitleInputChange: function (e) {
      this.setState({
        source_title: e.target.value
      });
    },
    onDestinationTitleInputChange: function (e) {
      this.setState({
        destination_title: e.target.value
      });
    },
    render: function () {
      var deleteButton = this.props.course.id ? React.createElement(
        "button",
        { className: "deleteButton", onClick: this.onDelete },
        "Delete"
      ) : "";
      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "toolbar topToolbar" },
          React.createElement(
            "button",
            { className: "linkButton", onClick: this.props.onMain },
            "Back"
          )
        ),
        React.createElement(
          "h2",
          null,
          this.props.course.id ? "Edit " + this.props.course.title : "Create course"
        ),
        React.createElement(
          "div",
          { className: "formRow formLabelInputPair" },
          React.createElement(
            "label",
            { htmlFor: "courseTitleInput" },
            "Title"
          ),
          React.createElement("input", { id: "courseTitleInput", placeholder: "Title", autoFocus: true, required: true,
            type: "text", onChange: this.onTitleInputChange,
            value: this.state.title })
        ),
        React.createElement(
          "div",
          { className: "formRow formLabelInputPair" },
          React.createElement(
            "label",
            { htmlFor: "courseSourceTitleInput" },
            "Source title"
          ),
          React.createElement("input", { id: "courseSourceTitleInput", placeholder: "Source title", required: true,
            type: "text", onChange: this.onSourceTitleInputChange,
            value: this.state.source_title })
        ),
        React.createElement(
          "div",
          { className: "formRow formLabelInputPair" },
          React.createElement(
            "label",
            { htmlFor: "courseDestinationTitleInput" },
            "Destination title"
          ),
          React.createElement("input", { id: "courseDestinationTitleInput", placeholder: "Destination title", required: true,
            type: "text", onChange: this.onDestinationTitleInputChange,
            value: this.state.destination_title })
        ),
        React.createElement(
          "div",
          { className: "formRow formLabelInputPair" },
          React.createElement(
            "label",
            { htmlFor: "courseTestOkSuccessCountInput" },
            "Test success count"
          ),
          React.createElement("input", { id: "courseTestOkSuccessCountInput", type: "number",
            value: this.state.test_ok_success_count,
            onChange: this.onTestOkSuccessCountChange })
        ),
        React.createElement(
          "div",
          { className: "formRow" },
          win.Constants.testTypes.map(function (testType) {
            var text = win.Language[testType].replace("%source%", this.state.source_title).replace("%destination%", this.state.destination_title);
            return React.createElement(
              "div",
              { className: "formInputLabelPair", key: testType },
              React.createElement("input", { checked: typeof this.state[testType] === "undefined" ? false : this.state[testType],
                onChange: this.onTestTypeChange,
                "data-id": testType, type: "checkbox", id: testType }),
              React.createElement(
                "label",
                { htmlFor: testType },
                text
              )
            );
          }, this)
        ),
        React.createElement(
          "div",
          { className: "toolbar bottomToolbar" },
          React.createElement(
            "button",
            { disabled: !!!this.state.title, onClick: this.onSave },
            "Save"
          ),
          deleteButton
        )
      );
    }
  });
})(window);