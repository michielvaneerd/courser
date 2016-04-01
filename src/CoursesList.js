(function(win) {

  win.CoursesList = React.createClass({
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
      
    },
    onDropboxConnect : function() {
      this.props.store.dispatch({
        type : "DROPBOX_CONNECT"
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
      return (
        <div id="screen">
          <div id="navbar">
            <div id="navbarTitle">Courses</div>
            <div className="navbarButtonContainer" id="navbarRight">
            {this.props.dropboxAccount
              ? <button onClick={this.onDropboxDisconnect}>{this.props.dropboxAccount.name.display_name}</button>
              : <button onClick={this.onDropboxConnect}>Dropbox</button>}
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
        </div>
      );
    }
  });

}(window));