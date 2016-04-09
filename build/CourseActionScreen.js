(function (win) {

  win.CourseActionScreen = React.createClass({
    displayName: "CourseActionScreen",

    onEntriesClick: function () {
      this.props.store.dispatch({
        type: "REQUEST_SELECT_ENTRIES",
        value: this.props.course.id
      });
    },
    onDoClick: function () {

      var disableTestInfo = [];
      if (this.props.course.count <= 4) {
        disableTestInfo.push("- create at least 5 entries");
      }
      if (win.Constants.testTypes.filter(function (testType) {
        return this.props.course[testType] === true;
      }, this).length == 0) {
        disableTestInfo.push("- choose at least 1 test type in Edit course screen");
      }
      if (disableTestInfo.length) {
        alert("Please make sure to:\n\n" + disableTestInfo.join("\n"));
        return;
      }

      this.props.store.dispatch({
        type: "REQUEST_DO_COURSE",
        value: this.props.course.id
      });
    },
    onShuffleClick: function () {
      this.props.store.dispatch({
        type: "REQUEST_DO_SHUFFLE",
        value: this.props.course.id
      });
    },
    onEditClick: function () {
      this.props.store.dispatch({
        type: "SELECT_COURSE_EDIT",
        value: this.props.course.id
      });
    },
    render: function () {
      var disableTestInfo = [];
      if (this.props.course.count <= 4) {
        disableTestInfo.push("Create at least 5 entries");
      }
      if (win.Constants.testTypes.filter(function (testType) {
        return this.props.course[testType] === true;
      }, this).length == 0) {
        disableTestInfo.push("Choose at least 1 test type");
      }
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
              { className: "fullwidthButton", onClick: this.props.onMain },
              "<"
            )
          ),
          React.createElement(
            "div",
            { id: "navbarTitle" },
            this.props.course.title
          )
        ),
        React.createElement(
          "div",
          { id: "main" },
          React.createElement(
            "div",
            { className: "row" },
            React.createElement(
              "button",
              { className: "normalButton fullwidthButton", onClick: this.onEntriesClick },
              "Entries (",
              this.props.course.count,
              ")"
            )
          ),
          React.createElement(
            "div",
            { className: "row" },
            React.createElement(
              "button",
              {
                className: "normalButton fullwidthButton",
                disabled: this.props.course.count == 0,
                onClick: this.onShuffleClick },
              "Shuffle"
            )
          ),
          React.createElement(
            "div",
            { className: "row" },
            React.createElement(
              "button",
              {
                className: "normalButton fullwidthButton",
                onClick: this.onDoClick },
              "Test"
            )
          ),
          React.createElement(
            "div",
            { className: "row" },
            React.createElement(
              "button",
              { className: "normalButton fullwidthButton", onClick: this.onEditClick },
              "Edit"
            )
          )
        )
      );
    }
  });
})(window);