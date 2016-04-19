// https://developers.google.com/web/updates/2015/10/display-mode

(function(win) {
  
  function countDownForInRequestSpinner() {
    var t = setTimeout(function() {
      clearTimeout(t);
      var el = document.getElementById("inProgress");
      if (el) {
        el.className = "visibleSpinner";
      }
    }, 500);
  }
  
  win.noop = function() {};

  var App = React.createClass({
    store : null,
    propTypes : {
      store : React.PropTypes.shape({
        dispatch : React.PropTypes.func,
        subscribe : React.PropTypes.func,
        getState : React.PropTypes.func
      })
    },
    beforeUnload : function(event) {
      for (var key in this.state.courses) {
        if (this.state.courses[key].dropbox_id && this.state.courses[key].hasLocalChange) {
          var msg = "Some changes have not been saved to Dropbox yet and may be overwritten when you start the app the next time. If you don't want this, save to Dropbox first before leaving this page.";
          event.returnValue = msg;
          return msg;
        }
      }
    },
    onKeyDown : function(e) {
      var me = this;
      if (e.keyCode == 27) {
        me.store.dispatch({
          type : "ESC_TYPED"
        });
      }
    },
    onPopState : function(e) {
      this.store.dispatch({
        type : "SCREEN_BACK"
      });
    },
    onBack : function() {
      this.store.dispatch({
        type : "SCREEN_BACK"
      });
    },
    componentDidMount : function() {
      var me = this;
      win.Storage.ready().then(function() {
        win.initStore(win.Storage, me.props.dropbox);
        me.store = win.Store;
        me.store.subscribe(function() {
          me.setState(me.store.getState());
        });
        if (me.props.dropbox.accessToken && navigator.onLine) {
          me.store.dispatch({
            type : "REQUEST_DROPBOX_ACCOUNT" // will call SELECT_COURSES
          });
        } else {
          me.store.dispatch({
            type : "SELECT_COURSES"
          });
        }
      }).catch(function(error) {
        console.log(error);
        alert(error);
      });
      //history.pushState({screen : null}, ""); // will remove all forward history.
      win.addEventListener("beforeunload", this.beforeUnload);
      win.addEventListener("popstate", this.onPopState);
      win.document.documentElement.addEventListener("keydown", this.onKeyDown);
    },
    componentWillUnmount : function() {
      win.removeEventListener("beforeunload", this.beforeUnload);
      win.document.documentElement.removeEventListener("keydown", this.onKeyDown);
    },
    getInitialState : function() {
      return win.getDefaultState();
    },
    onClearType : function(type) {
      this.store.dispatch({
        type : type
      });
    },
    onClearError : function() {
      this.onClearType("ERROR");
    },
    onClearSuccess : function() {
      this.onClearType("SUCCESS");
    },
    onClearWarning : function() {
      this.onClearType("WARNING");
    },
    render : function() {
      var screen = null;
      var course = this.state.courseId
        ? this.state.courses[this.state.courseId] : {};
      var entry = this.state.entryId
        ? this.state.entries[this.state.entryId] : {};
      var progressSpinner = "";
      if (this.state.inRequest) {
        progressSpinner = <div id="inProgress">{typeof this.state.inRequest === "string" ? this.state.inRequest : "Please wait, I'm doing something..."}</div>
        countDownForInRequestSpinner();
      }
        
      switch (this.state.screen) {
        case "ENTRIES_SCREEN":
          screen = <EntriesScreen
            entriesMenuShow={this.state.entriesMenuShow}
            entriesFilter={this.state.entriesFilter}
            forceBackToMainScreen={this.state.forceBackToMainScreen}
            store={this.store}
            course={course}
            onBack={this.onBack}
            entry={entry}
            entryIds={this.state.entryIds}
            entriesOrder={this.state.entriesOrder}
            entries={this.state.entries} />
          break;
        case "COURSE_EDIT_SCREEN":
          screen = <CourseScreen
            onBack={this.onBack}
            store={this.store}            
            course={course} />
          break;
        case "COURSE_ACTION_SCREEN":
          screen = <CourseActionScreen
            onBack={this.onBack}
            courseActionMenuShow={this.state.courseActionMenuShow}
            sharedLink={this.state.sharedLink}
            dropboxAccount={this.state.dropboxAccount}
            store={this.store}            
            course={course} />
          break;
        case "DO_COURSE_SCREEN":
          screen = <DoCourseScreen
            answer={this.state.answer}
            doCourseMenuShow={this.state.doCourseMenuShow}
            doCourseEntryId={this.state.doCourseEntryId}
            doCourseAnswerEntryIds={this.state.doCourseAnswerEntryIds}
            doCourseTestType={this.state.doCourseTestType}
            answerEntryId={this.state.answerEntryId}
            doCourseSuccess={this.state.doCourseSuccess}
            forceBackToMainScreen={this.state.forceBackToMainScreen}
            store={this.store}
            onBack={this.onBack}
            entries={this.state.entries}
            success={this.state.success}
            implicitCourseId={this.state.implicitCourseId}
            course={course} />
          break;
        case "SHUFFLE_SCREEN":
          screen = <ShuffleScreen
            forceBackToMainScreen={this.state.forceBackToMainScreen}
            shuffleMenuShow={this.state.shuffleMenuShow}
            store={this.store}
            course={course}
            onBack={this.onBack}
            entry={entry}
            entries={this.state.entries} />
          break;
        default:
          screen = <CoursesList
            coursesListMenuShow={this.state.coursesListMenuShow}
            dropboxAccount={this.state.dropboxAccount}
            store={this.store}
            courses={this.state.courses} />
          break;
      }
      return (
        <div>
          {screen}
          {progressSpinner}
          {this.state.error
            ? <Dialog onClear={this.onClearError} type="error" message={this.state.error} />
            : null}
          {this.state.warning
            ? <Dialog onClear={this.onClearWarning} type="warning" message={this.state.warning} />
            : null}
          {this.state.success
            ? <Dialog onClear={this.onClearSuccess} type="success" message={this.state.success} />
            : null}
        </div>
      );
    }
  });
  
  var dropbox = new Dropbox("r0rft8iznsi5atw", {
    accessToken : window.localStorage.getItem("access_token"),
    onAccessToken : function(accessToken) {
      window.localStorage.setItem("access_token", accessToken);
    }
  });
  try {
    if (dropbox.handleAuthorizationRedirect()) {
      return;
    }
  } catch (ex) {
    alert(ex);
  }
  
  ReactDOM.render(<App dropbox={dropbox} />, win.document.getElementById("app"));
  
  // Start service worker
  // if ('serviceWorker' in navigator) {
    // navigator.serviceWorker.register('service-worker.js', {
      // scope: '.'
    // }).then(function(registration) {
      // console.log('The service worker has been registered ', registration);
    // });
  // }

}(window));
