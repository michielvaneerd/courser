(function(win) {

  var App = React.createClass({
    propTypes : {
      store : React.PropTypes.shape({
        dispatch : React.PropTypes.func,
        subscribe : React.PropTypes.func,
        getState : React.PropTypes.func
      })
    },
    componentWillMount : function() {
      var me = this;
      this.props.store.subscribe(function() {
        me.setState(me.props.store.getState());
      });
    },
    componentDidMount : function() {
      this.props.store.dispatch({
        type : "SELECT_COURSES"
      });
    },
    getInitialState : function() {
      return this.props.store.getState();
    },
    onMain : function() {
      this.props.store.dispatch({
        type : "SELECT_COURSE",
        value : 0
      });
    },
    render : function() {
      var screen = null;
      var course = this.state.courseId
        ? this.state.courses[this.state.courseId] : {};
      var entry = this.state.entryId
        ? this.state.entries[this.state.entryId] : {};
      var progressSpinner = this.state.inRequest
        ? <div id="inProgress">Busy!</div> : "";
      var errorDialog = this.state.error
        ? <ErrorDialog
            error={this.state.error}
            store={this.props.store} /> : "";
      switch (this.state.screen) {
        case "ENTRIES_SCREEN":
          screen = <EntriesScreen
            store={this.props.store}
            course={course}
            entry={entry}
            entries={this.state.entries} />
          break;
        case "COURSE_SCREEN":
          screen = <CourseScreen
            onMain={this.onMain}
            store={this.props.store}
            course={course} />
          break;
        default:
          screen = <CoursesList
            store={this.props.store}
            courses={this.state.courses} />
          break;
      }
      return (
        <div>
          {screen}
          {progressSpinner}
          {errorDialog}
        </div>
      );
    }
  });
  
  ReactDOM.render(<App store={win.Store} />, win.document.getElementById("app"));

}(window));
