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
    render : function() {
      /*
      <div className="navbarButtonContainer" id="navbarRight">
              <button onClick={this.onMore}>:</button>
            </div>
            */

      var moreMenu = "";
      var moreMenuItems = null;
      if (this.state.showMore) {
        if (this.props.dropboxAccount) {
          moreMenuItems = [
            <li key="dropboxsave"><a onClick={this.onDropboxSave}>Save to Dropbox</a></li>,
            <li key="dropboxdisconnect"><a onClick={this.onDropboxDisconnect}>Disconnect from Dropbox</a></li>
          ];
        } else {
          moreMenuItems = [
            <li key="dropboxconnect"><a onClick={this.onDropboxConnect}>Connect to Dropbox</a></li>
          ];
        }
        moreMenu = (
          <ul id="popup" className="listView">{moreMenuItems}</ul>
        );
      }
            
      return (
        <div id="screen">
          <div id="navbar">
            <div id="navbarTitle">Courses</div>
            <div className="navbarButtonContainer" id="navbarRight">
              <button onClick={this.onMore}>&#9776;</button>
            </div>
          </div>
          <div id="main">
            <ul className="listView">
              {Object.keys(this.props.courses).map(function(courseId) {
                var course = this.props.courses[courseId];
                return (
                  <li key={course.id}>
                    <a href="#" className="linkButton" onClick={this.onCourseClick}
                      data-id={courseId}>{course.title}</a>
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