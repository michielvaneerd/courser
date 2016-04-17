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
    onDropboxAddFromSharedLink: function () {
      var link = prompt("Enter shared link");
      if (link) {
        this.props.store.dispatch({
          type: "REQUEST_ADD_COURSE_FROM_SHARED_LINK",
          value: link
        });
      }
    },
    render: function () {
      var moreMenu = "";
      var moreMenuItems = null;
      if (this.state.showMore) {
        var disabledClass = navigator.onLine ? "" : "disabledLink";
        if (this.props.dropboxAccount) {
          moreMenuItems = [React.createElement(
            "li",
            { key: "dropboxsave" },
            React.createElement(
              "a",
              { className: disabledClass, onClick: navigator.onLine ? this.onDropboxSave : win.noop },
              "Save to Dropbox"
            )
          ), React.createElement(
            "li",
            { key: "dropboxshare" },
            React.createElement(
              "a",
              { className: disabledClass, onClick: navigator.onLine ? this.onDropboxAddFromSharedLink : win.noop },
              "Add course from shared link"
            )
          ), React.createElement(
            "li",
            { key: "dropboxdisconnect" },
            React.createElement(
              "a",
              { className: disabledClass, onClick: this.onDropboxDisconnect },
              "Disconnect from Dropbox"
            )
          )];
        } else {
          moreMenuItems = [React.createElement(
            "li",
            { key: "dropboxconnect" },
            React.createElement(
              "a",
              { className: disabledClass, onClick: navigator.onLine ? this.onDropboxConnect : win.noop },
              "Connect to Dropbox"
            )
          )];
        }
        moreMenuItems.push(React.createElement(
          "li",
          { key: "about" },
          React.createElement(
            "a",
            { href: "https://github.com/michielvaneerd/courser", target: "_blank" },
            "About Courser"
          )
        ));
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
              "="
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
                  course.title,
                  course.hasLocalChange ? " *" : ""
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