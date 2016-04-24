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
        type: "CREATE_COURSE"
      });
    },
    onMore: function () {
      this.props.store.dispatch({
        type: "SHOW_COURSESLIST_MENU",
        value: !this.props.coursesListMenuShow
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
      if (this.props.coursesListMenuShow) {
        var disabledClass = navigator.onLine ? "" : "disabledLink";
        if (this.props.dropboxAccount) {
          moreMenuItems = [React.createElement(
            "li",
            { key: "dropboxname" },
            React.createElement(
              "a",
              { className: "menuLabel" },
              "Connected as ",
              this.props.dropboxAccount.name.display_name
            )
          ), React.createElement(
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
            "About Courser (v.",
            COURSER_VERSION,
            STANDALONE ? " sa" : "",
            ")"
          )
        ));
        //if (!this.props.fromHomeScreen) {
        //  moreMenuItems.push(<li key="homescreen"><a className="menuLabel">Add this to your homescreen for the best experience</a></li>);
        //}
        moreMenu = React.createElement(
          "ul",
          { id: "popup", className: "listView" },
          moreMenuItems
        );
      }
      var hasLocalChange = "";
      for (var key in this.props.courses) {
        if (this.props.courses[key].dropbox_id && this.props.courses[key].hasLocalChange) {
          hasLocalChange = " *";
          break;
        }
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
            "Courses",
            hasLocalChange
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
                  course.dropbox_id && course.hasLocalChange ? " *" : ""
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