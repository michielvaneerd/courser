(function (win) {

  win.CoursesList = React.createClass({
    displayName: "CoursesList",

    getInitialState: function () {
      return { showMore: false };
    },
    componentWillReceiveProps: function (nextProps) {
      this.setState({ showMore: false });
    },
    onCourseClick: function (e) {
      e.preventDefault();
      this.props.store.dispatch({
        type: "SELECT_COURSE",
        value: e.currentTarget.dataset.id
      });
    },
    onCreateCourse: function () {
      this.props.store.dispatch({
        type: "CREATE_COURSE"
      });
    },
    onMore: function () {
      this.setState({
        showMore: !this.state.showMore
      });
    },
    onDropboxConnect: function () {
      this.props.store.dispatch({
        type: "DROPBOX_CONNECT"
      });
    },
    onDropboxSave: function () {
      this.props.store.dispatch({
        type: "DROPBOX_SAVE"
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

      var moreMenu = "";
      var moreMenuItems = null;
      if (this.state.showMore) {
        if (this.props.dropboxAccount) {
          moreMenuItems = [React.createElement(
            "li",
            { key: "dropboxsave" },
            React.createElement(
              "a",
              { onClick: this.onDropboxSave },
              "Save to Dropbox"
            )
          ), React.createElement(
            "li",
            { key: "dropboxdisconnect" },
            React.createElement(
              "a",
              { onClick: this.onDropboxDisconnect },
              "Disconnect from Dropbox"
            )
          )];
        } else {
          moreMenuItems = [React.createElement(
            "li",
            { key: "dropboxconnect" },
            React.createElement(
              "a",
              { onClick: this.onDropboxConnect },
              "Connect to Dropbox"
            )
          )];
        }
        moreMenu = React.createElement(
          "ul",
          { id: "popup", className: "listView" },
          moreMenuItems
        );
      }

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
            React.createElement(
              "button",
              { onClick: this.onMore },
              "☰"
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
        ),
        moreMenu
      );
    }
  });
})(window);