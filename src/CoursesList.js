(function(win) {

  win.CoursesList = React.createClass({
    getInitialState : function() {
      return {showMore : false};
    },
    componentWillReceiveProps : function(nextProps) {
      this.setState({showMore : false});
    },
    onCourseClick : function(e) {
      e.preventDefault();
      this.props.store.dispatch({
        type : "SELECT_COURSE",
        value : e.currentTarget.dataset.id
      });
    },
    onCreateCourse : function() {
      this.props.store.dispatch({
        type : "CREATE_COURSE"
      });
    },
    onMore : function() {
      this.setState({
        showMore : !this.state.showMore
      });
    },
    onDropboxConnect : function() {
      this.props.store.dispatch({
        type : "DROPBOX_CONNECT"
      });
    },
    onDropboxSave : function() {
      this.props.store.dispatch({
        type : "DROPBOX_SAVE"
      });
    },
    onDropboxDisconnect : function() {
      this.props.store.dispatch({
        type : "DROPBOX_DISCONNECT"
      });
    },
    onDropboxAddFromSharedLink : function() {
      var link = prompt("Enter shared link");
      if (link) {
        this.props.store.dispatch({
          type : "REQUEST_ADD_COURSE_FROM_SHARED_LINK",
          value : link
        });
      }
    },
    render : function() {
      var moreMenu = "";
      var moreMenuItems = null;
      if (this.state.showMore) {
        var disabledClass = navigator.onLine ? "" : "disabledLink";
        if (this.props.dropboxAccount) {
          moreMenuItems = [
            <li key="dropboxname"><a className="menuLabel">Connected as {this.props.dropboxAccount.name.display_name}</a></li>,
            <li key="dropboxsave"><a className={disabledClass} onClick={navigator.onLine ? this.onDropboxSave: win.noop}>Save to Dropbox</a></li>,
            <li key="dropboxshare"><a className={disabledClass} onClick={navigator.onLine ? this.onDropboxAddFromSharedLink : win.noop}>Add course from shared link</a></li>,
            <li key="dropboxdisconnect"><a className={disabledClass} onClick={this.onDropboxDisconnect}>Disconnect from Dropbox</a></li>
          ];
        } else {
          moreMenuItems = [
            <li key="dropboxconnect"><a className={disabledClass} onClick={navigator.onLine ? this.onDropboxConnect : win.noop}>Connect to Dropbox</a></li>
          ];
        }
        moreMenuItems.push(<li key="about"><a href="https://github.com/michielvaneerd/courser" target="_blank">About Courser</a></li>);
        moreMenu = (
          <ul id="popup" className="listView">{moreMenuItems}</ul>
        );
      }
      var hasLocalChange = "";
      for (var key in this.props.courses) {
        if (this.props.courses[key].dropbox_id && this.props.courses[key].hasLocalChange) {
          hasLocalChange = " *";
          break;
        }
      }
      return (
        <div id="screen">
          <div id="navbar">
            <div id="navbarTitle">Courses{hasLocalChange}</div>
            <div className="navbarButtonContainer" id="navbarRight">
              <button onClick={this.onMore}>=</button>
            </div>
          </div>
          <div id="main">
            <ul className="listView">
              {Object.keys(this.props.courses).map(function(courseId) {
                var course = this.props.courses[courseId];
                return (
                  <li key={course.id}>
                    <a href="#" className="linkButton" onClick={this.onCourseClick}
                      data-id={courseId}>{course.title}{course.dropbox_id && course.hasLocalChange ? " *" : ""}</a>
                  </li>
                );
              }, this)}
            </ul>
          </div>
          <button className="floatingButton" id="floatingBottomButton" onClick={this.onCreateCourse}>+</button>
            {moreMenu}
        </div>
      );
    }
  });

}(window));