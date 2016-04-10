(function (win) {

  var invalidity = {
    invalidTitle: false,
    showMore: false
  };

  win.CourseScreen = React.createClass({
    displayName: "CourseScreen",

    getInitialState: function () {
      return Object.assign({
        source_title: "Source",
        destination_title: "Destination",
        test_ok_success_count: 1,
        title: "",
        DESTINATION_SOURCE_CHOOSE: true,
        SOURCE_DESTINATION_CHOOSE: true
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
      if (!confirm("Delete course '" + this.props.course.title + "' with " + this.props.course.count + " entries?")) {
        return;
      }
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
    onMore: function () {
      this.setState({
        showMore: !this.state.showMore
      });
    },
    onBack: function () {
      this.props.store.dispatch({
        type: "SELECT_COURSE",
        value: this.props.course.id
      });
    },
    render: function () {
      return React.createElement(
        "div",
        { id: "screen" },
        React.createElement(
          "div",
          { id: "navbar" },
          React.createElement(
            "div",
            { className: "navbarButtonContainer", id: "navbarLeft" },
            React.createElement(
              "button",
              { onClick: this.onBack },
              "<"
            )
          ),
          React.createElement(
            "div",
            { id: "navbarTitle" },
            this.props.course.id ? this.props.course.title : "Create course"
          ),
          this.props.course.id ? React.createElement(
            "div",
            { className: "navbarButtonContainer", id: "navbarRight" },
            React.createElement(
              "button",
              { onClick: this.onMore },
              "="
            )
          ) : ""
        ),
        React.createElement(
          "div",
          { id: "main" },
          React.createElement(
            "div",
            { className: "row" },
            React.createElement(
              "label",
              { className: "titleLabel", htmlFor: "courseTitleInput" },
              "Title"
            ),
            React.createElement("input", { id: "courseTitleInput", placeholder: "Title", autoFocus: true, required: true,
              type: "text", onChange: this.onTitleInputChange,
              value: this.state.title })
          ),
          React.createElement(
            "div",
            { className: "row" },
            React.createElement(
              "label",
              { className: "titleLabel", htmlFor: "courseSourceTitleInput" },
              "Source"
            ),
            React.createElement("input", { id: "courseSourceTitleInput", placeholder: "Source title", required: true,
              type: "text", onChange: this.onSourceTitleInputChange,
              value: this.state.source_title })
          ),
          React.createElement(
            "div",
            { className: "row" },
            React.createElement(
              "label",
              { className: "titleLabel", htmlFor: "courseDestinationTitleInput" },
              "Destination"
            ),
            React.createElement("input", { id: "courseDestinationTitleInput", placeholder: "Destination title", required: true,
              type: "text", onChange: this.onDestinationTitleInputChange,
              value: this.state.destination_title })
          ),
          React.createElement(
            "div",
            { className: "row" },
            React.createElement(
              "label",
              { className: "titleLabel", htmlFor: "courseTestOkSuccessCountInput" },
              "Test success count"
            ),
            React.createElement("input", { id: "courseTestOkSuccessCountInput", type: "number",
              value: this.state.test_ok_success_count,
              onChange: this.onTestOkSuccessCountChange })
          ),
          React.createElement(
            "div",
            { className: "row" },
            React.createElement(
              "label",
              { className: "titleLabel" },
              "Test types"
            ),
            win.Constants.testTypes.map(function (testType) {
              var text = win.Language[testType].replace("%source%", this.state.source_title).replace("%destination%", this.state.destination_title);
              return React.createElement(
                "div",
                { className: "rowinner", key: testType },
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
            { className: "row" },
            React.createElement(
              "button",
              { className: "normalButton fullwidthButton primaryButton", disabled: !!!this.state.title,
                onClick: this.onSave },
              "Save"
            )
          )
        ),
        this.state.showMore ? React.createElement(
          "ul",
          { id: "popup", className: "listView" },
          React.createElement(
            "li",
            null,
            React.createElement(
              "a",
              { onClick: this.onDelete },
              "Delete"
            )
          )
        ) : ""
      );
    }
  });
})(window);