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
          "ul",
          null,
          Object.keys(this.props.courses).map(function (courseId) {
            var course = this.props.courses[courseId];
            return React.createElement(
              "li",
              { key: course.id },
              React.createElement(
                "a",
                { onClick: this.onCourseClick, "data-id": courseId,
                  href: "#" },
                React.createElement(
                  "strong",
                  null,
                  course.title
                )
              ),
              " (",
              React.createElement(
                "a",
                { href: "#", "data-id": courseId,
                  onClick: this.onEntriesClick },
                course.count,
                " entries"
              ),
              ", ",
              React.createElement(
                "a",
                { href: "#", "data-id": courseId,
                  onClick: this.onDoClick },
                course.count_attempt_success,
                " done"
              ),
              ")"
            );
          }, this)
        ),
        React.createElement(
          "div",
          null,
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