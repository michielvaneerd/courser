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
    render : function() {
      return (
        <div>
          <ul>
            {Object.keys(this.props.courses).map(function(courseId) {
              var course = this.props.courses[courseId];
              return <li key={course.id}>
                  <a onClick={this.onCourseClick} data-id={courseId}
                    href="#">{course.title} ({course.count} / {course.count_attempt_success})</a>
                </li>
            }, this)}
          </ul>
          <div>
            <button onClick={this.onCreateCourse}>Create course</button>
          </div>
        </div>
      );
    }
  });

}(window));