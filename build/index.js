(function (win) {

  var App = React.createClass({
    displayName: "App",

    componentWillMount: function () {
      var me = this;
      this.props.store.subscribe(function () {
        me.setState(me.props.store.getState());
      });
    },
    componentDidMount: function () {
      this.props.store.dispatch({
        type: "SELECT_COURSES"
      });
    },
    getInitialState: function () {
      return this.props.store.getState();
    },
    onMain: function () {
      this.props.store.dispatch({
        type: "SELECT_COURSE",
        value: 0
      });
    },
    render: function () {
      var screen = null;
      var course = this.state.courseId ? this.state.courses[this.state.courseId] : {};
      var entry = this.state.entryId ? this.state.entries[this.state.entryId] : {};
      var progressSpinner = this.state.inRequest ? React.createElement(
        "div",
        { id: "inProgress" },
        "Busy!"
      ) : "";
      switch (this.state.screen) {
        case "ENTRIES_SCREEN":
          screen = React.createElement(EntriesScreen, {
            store: this.props.store,
            course: course,
            entry: entry,
            entries: this.state.entries });
          break;
        case "COURSE_SCREEN":
          screen = React.createElement(CourseScreen, {
            onMain: this.onMain,
            store: this.props.store,
            course: course });
          break;
        default:
          screen = React.createElement(CoursesList, {
            store: this.props.store,
            courses: this.state.courses });
          break;
      }
      return React.createElement(
        "div",
        null,
        screen,
        progressSpinner
      );
    }
  });

  ReactDOM.render(React.createElement(App, { store: win.Store }), win.document.getElementById("app"));
})(window);