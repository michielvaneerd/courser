(function (win) {

  win.CoursesList = React.createClass({
    displayName: "CoursesList",

    onCourseClick: function (e) {
      e.preventDefault();
      this.props.store.dispatch({
        type: "SELECT_COURSE",
        value: e.currentTarget.dataset.id
      });
    },
    onCreateCourse: function () {
      this.props.store.dispatch({
        type: "SHOW_COURSE_SCREEN"
      });
    },
    onEntriesClick: function (e) {
      e.preventDefault();
      this.props.store.dispatch({
        type: "REQUEST_SELECT_ENTRIES",
        value: e.currentTarget.dataset.id,
        forceBackToMainScreen: true
      });
    },
    onDoClick: function (e) {
      e.preventDefault();
      this.props.store.dispatch({
        type: "REQUEST_DO_COURSE",
        value: e.currentTarget.dataset.id,
        forceBackToMainScreen: true
      });
    },
    render: function () {
      return React.createElement(
        "div",
        null,
        React.createElement(
          "h2",
          null,
          "Courses"
        ),
        React.createElement(
          "table",
          null,
          React.createElement(
            "tbody",
            null,
            Object.keys(this.props.courses).map(function (courseId) {
              var course = this.props.courses[courseId];
              return React.createElement(
                "tr",
                { key: course.id },
                React.createElement(
                  "td",
                  null,
                  React.createElement(
                    "button",
                    { className: "linkButton", onClick: this.onCourseClick,
                      "data-id": courseId },
                    React.createElement(
                      "strong",
                      null,
                      course.title
                    )
                  )
                ),
                React.createElement(
                  "td",
                  null,
                  React.createElement(
                    "button",
                    { className: "linkButton", "data-id": courseId,
                      onClick: this.onEntriesClick },
                    course.count,
                    " entries"
                  )
                ),
                React.createElement(
                  "td",
                  null,
                  course.count > 4 ? React.createElement(
                    "button",
                    { className: "linkButton", "data-id": courseId,
                      onClick: this.onDoClick },
                    course.count_attempt_success,
                    " done"
                  ) : ""
                )
              );
            }, this)
          )
        ),
        React.createElement(
          "div",
          { className: "bottomToolbar" },
          React.createElement(
            "button",
            { onClick: this.onCreateCourse },
            "Create course"
          )
        )
      );
    }
  });
})(window);