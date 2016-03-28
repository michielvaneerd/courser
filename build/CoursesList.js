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
    onMore: function () {},
    onDoClick: function (e) {
      e.preventDefault();
      this.props.store.dispatch({
        type: "REQUEST_DO_COURSE",
        value: e.currentTarget.dataset.id,
        forceBackToMainScreen: true
      });
    },
    onShuffleClick: function (e) {
      e.preventDefault();
      this.props.store.dispatch({
        type: "REQUEST_DO_SHUFFLE",
        value: e.currentTarget.dataset.id,
        forceBackToMainScreen: true
      });
    },
    onDropboxConnect: function () {
      this.props.store.dispatch({
        type: "DROPBOX_CONNECT"
      });
    },
    onDropboxDisconnect: function () {
      this.props.store.dispatch({
        type: "DROPBOX_DISCONNECT"
      });
    },
    render: function () {
      /*
      <div className="navbarButtonContainer" id="navbarRight">
              <button onClick={this.onMore}>:</button>
            </div>
            */
      return React.createElement(
        "div",
        { id: "screen" },
        React.createElement(
          "div",
          { id: "navbar" },
          React.createElement(
            "div",
            { id: "navbarTitle" },
            "Courses"
          ),
          React.createElement(
            "div",
            { className: "navbarButtonContainer", id: "navbarRight" },
            this.props.dropboxAccount ? React.createElement(
              "button",
              { onClick: this.onDropboxDisconnect },
              this.props.dropboxAccount.name.display_name
            ) : React.createElement(
              "button",
              { onClick: this.onDropboxConnect },
              "Dropbox"
            )
          )
        ),
        React.createElement(
          "div",
          { id: "main" },
          React.createElement(
            "ul",
            { className: "listView" },
            Object.keys(this.props.courses).map(function (courseId) {
              var course = this.props.courses[courseId];
              return React.createElement(
                "li",
                { key: course.id },
                React.createElement(
                  "a",
                  { href: "#", className: "linkButton", onClick: this.onCourseClick,
                    "data-id": courseId },
                  course.title
                )
              );
            }, this)
          )
        ),
        React.createElement(
          "button",
          { className: "floatingButton", id: "floatingBottomButton", onClick: this.onCreateCourse },
          "+"
        )
      );
    }
  });
})(window);