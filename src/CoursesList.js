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
        type : "SHOW_COURSE_SCREEN"
      });
    },
    onEntriesClick : function(e) {
      e.preventDefault();
      this.props.store.dispatch({
        type : "REQUEST_SELECT_ENTRIES",
        value : e.currentTarget.dataset.id,
        forceBackToMainScreen : true
      });
    },
    onDoClick : function(e) {
      e.preventDefault();
      this.props.store.dispatch({
        type : "REQUEST_DO_COURSE",
        value : e.currentTarget.dataset.id,
        forceBackToMainScreen : true
      });
    },
    render : function() {
      return (
        <div>
          <h2>Courses</h2>
          <table>
            <tbody>
              {Object.keys(this.props.courses).map(function(courseId) {
                var course = this.props.courses[courseId];
                return (
                  <tr key={course.id}>
                    <td>
                      <a onClick={this.onCourseClick} data-id={courseId}
                        href="#"><strong>{course.title}</strong></a>
                    </td>
                    <td>
                      <a href="#" data-id={courseId}
                        onClick={this.onEntriesClick}>{course.count} entries</a>
                    </td>
                    <td>
                      {course.count > 4
                        ? <a href="#" data-id={courseId}
                            onClick={this.onDoClick}>{course.count_attempt_success} done</a>
                        : ""}
                    </td>
                  </tr>
                );
              }, this)}
            </tbody>
          </table>
          <div className="bottomToolbar">
            <button onClick={this.onCreateCourse}>Create course</button>
          </div>
        </div>
      );
    }
  });

}(window));