(function (win) {

  function countDownForInRequestSpinner() {
    var t = setTimeout(function () {
      clearTimeout(t);
      var el = document.getElementById("inProgress");
      if (el) {
        el.className = "visibleSpinner";
      }
    }, 300);
  }

  var App = React.createClass({
    displayName: "App",

    propTypes: {
      store: React.PropTypes.shape({
        dispatch: React.PropTypes.func,
        subscribe: React.PropTypes.func,
        getState: React.PropTypes.func
      })
    },
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
        type: "SELECT_COURSES"
      });
    },
    onClearType: function (type) {
      this.props.store.dispatch({
        type: type
      });
    },
    onClearError: function () {
      this.onClearType("ERROR");
    },
    onClearSuccess: function () {
      this.onClearType("SUCCESS");
    },
    onClearWarning: function () {
      this.onClearType("WARNING");
    },
    render: function () {
      var screen = null;
      var course = this.state.courseId ? this.state.courses[this.state.courseId] : {};
      var entry = this.state.entryId ? this.state.entries[this.state.entryId] : {};
      var progressSpinner = "";
      if (this.state.inRequest) {
        progressSpinner = React.createElement(
          "div",
          { id: "inProgress" },
          "Busy!"
        );
        countDownForInRequestSpinner();
      }

      switch (this.state.screen) {
        case "ENTRIES_SCREEN":
          screen = React.createElement(EntriesScreen, {
            forceBackToMainScreen: this.state.forceBackToMainScreen,
            store: this.props.store,
            course: course,
            entry: entry,
            onMain: this.onMain,
            entries: this.state.entries });
          break;
        case "COURSE_SCREEN":
          screen = React.createElement(CourseScreen, {
            onMain: this.onMain,
            store: this.props.store,
            course: course });
          break;
        case "DO_COURSE_SCREEN":
          screen = React.createElement(DoCourseScreen, {
            answer: this.state.answer,
            doCourseEntryId: this.state.doCourseEntryId,
            doCourseAnswerEntryIds: this.state.doCourseAnswerEntryIds,
            doCourseTestType: this.state.doCourseTestType,
            answerEntryId: this.state.answerEntryId,
            doCourseSuccess: this.state.doCourseSuccess,
            forceBackToMainScreen: this.state.forceBackToMainScreen,
            store: this.props.store,
            onMain: this.onMain,
            entries: this.state.entries,
            success: this.state.success,
            implicitCourseId: this.state.implicitCourseId,
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
        progressSpinner,
        this.state.error ? React.createElement(Dialog, { onClear: this.onClearError, type: "error", message: this.state.error }) : null,
        this.state.warning ? React.createElement(Dialog, { onClear: this.onClearWarning, type: "warning", message: this.state.warning }) : null,
        this.state.success ? React.createElement(Dialog, { onClear: this.onClearSuccess, type: "success", message: this.state.success }) : null
      );
    }
  });

  win.StorageDB.ready().then(function () {
    win.initStore(win.StorageDB);
    ReactDOM.render(React.createElement(App, { store: win.Store }), win.document.getElementById("app"));
  }).catch(function (error) {
    alert(error);
  });

  // Start service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js', {
      scope: '.'
    }).then(function (registration) {
      console.log('The service worker has been registered ', registration);
    });
  }
})(window);