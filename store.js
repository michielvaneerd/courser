(function(win) {

	var defaultState = {
	  success : false,
    sortOrder : null,
	  inRequest : false,
    error : false,
    courseId : 0,
    entryId : 0,
    screen : null,
    courses : {}, // courseId => course
    entries : {} // entryId => entry (only for active course)
  };
  
  var storage = null;
  
  var errorHandler = function(error, state) {
    state.inRequest = false;
    Store.dispatch({
      type : "ERROR",
      value : error.toString()
    });
  };

	var appReducer = function(state, action) {

    if (typeof state === "undefined") {
      return defaultState;
    }
    
    if (state.inRequest) {
	    return state;
	  }

    if (action.type != "ERROR") {
      state.error = false;
    }
    
    state.success = false;
	  
	  state.inRequest = true;
	  var suppressInRequest = false;

    switch (action.type) {
      case "SELECT_COURSES":
        if (action.value) {
          state.courses = action.value;
          state.courseId = 0;
          state.entryId = 0;
          state.screen = null;
        } else {
          suppressInRequest = true;
          storage.getCourses().then(function(courses) {
            state.inRequest = false;
            Store.dispatch({
              type : "SELECT_COURSES",
              value : courses
            });
          }).catch(function(error) {
            errorHandler(error, state);
          });
        }
        break;
      case "SELECT_COURSE":
      	state.courseId = action.value;
        state.entryId = 0;
      	state.screen = state.courseId ? "COURSE_SCREEN" : null;
        break;
      case "SELECT_ENTRIES":
        if (action.value) {
          state.entryId = 0;
          state.entries = action.value;
          state.screen = "ENTRIES_SCREEN";
        } else {
          suppressInRequest = true;
          storage.getEntries(state.courseId).then(function(entries) {
            state.inRequest = false;
            Store.dispatch({
              type : "SELECT_ENTRIES",
              value : entries
            });
          }).catch(function(error) {
            errorHandler(error, state);
          });
        }
        break;
      case "REQUEST_SAVE_COURSE":
        if (action.value.title.length == 0) {
          state.inRequest = false;
          Store.dispatch({
            type : "ERROR",
            value : "Empty title!"
          });
          break;
        }
        suppressInRequest = true;
        storage.saveCourse(action.value).then(function(course) {
          state.inRequest = false;
          Store.dispatch({
            type : "SAVE_COURSE",
            value : course
          });
        }).catch(function(error) {
          errorHandler(error, state);
        });
        break;
      case "SAVE_COURSE":
        state.courseId = action.value.id;
        state.courses[state.courseId] = action.value;
        break;
      case "SELECT_ENTRY":
        state.entryId = action.value;
        break;
      case "REQUEST_SAVE_ENTRY":
        suppressInRequest = true;
        storage.saveEntry(action.value, state.courseId).then(function(entry) {
          state.inRequest = false;
          Store.dispatch({
            type : "SAVE_ENTRY",
            value : entry
          });
        }).catch(function(error) {
          errorHandler(error, state);
        });
        break;
      case "SAVE_ENTRY":
        if (!(action.value.id in state.entries)) {
          state.courses[state.courseId].count += 1;
        }
        state.entries[action.value.id] = action.value;
        state.entryId = 0;
        break;
      case "REQUEST_DELETE_ENTRY":
        suppressInRequest = true;
        storage.deleteEntry(state.entryId, state.courseId).then(function() {
          state.inRequest = false;
          Store.dispatch({
            type : "DELETE_ENTRY"
          });
        }).catch(function(error) {
          errorHandler(error, state);
        });
        break;
      case "DELETE_ENTRY":
        delete state.entries[state.entryId];
        state.courses[state.courseId].count -= 1;
        state.entryId = 0;
        break;
      case "SHOW_COURSE_SCREEN":
      	state.screen = "COURSE_SCREEN";
      	break;
      case "REQUEST_DELETE_COURSE":
        suppressInRequest = true;
        storage.deleteCourse(state.courseId).then(function() {
          state.inRequest = false;
          Store.dispatch({
            type : "DELETE_COURSE"
          });
        }).catch(function(error) {
          errorHandler(error, state);
        });
        break;
      case "DELETE_COURSE":
      	delete state.courses[state.courseId];
      	state.screen = null;
      	state.courseId = 0;
      	break;
      case "REQUEST_RESET":
        suppressInRequest = true;
        storage.resetCourse(state.courseId).then(function(entries) {
          state.inRequest = false;
          Store.dispatch({
            type : "RESET",
            value : entries
          });
        }).catch(function(error) {
          errorHandler(error, state);
        });
        break;
      case "RESET":
        state.entries = action.value;
        state.courses[state.courseId].count_attempt_success = 0;
        state.courses[state.courseId].count_attempt_failure = 0;
        break;
      case "REQUEST_DO_COURSE":        
        suppressInRequest = true;
        storage.getEntries(state.courseId).then(function(entries) {
          state.inRequest = false;
          Store.dispatch({
            type : "DO_COURSE",
            value : entries
          });
        }).catch(function(error) {
          errorHandler(error, state);
        });
        break;
      case "DO_COURSE":
        state.screen = "DO_COURSE_SCREEN";
        state.entries = action.value;
        break;
      case "REQUEST_SAVE_ANSWER":
        if (action.success) {
          action.value.attempt_success += 1;
        } else {
          action.value.attempt_failure += 1;
        }
        suppressInRequest = true;
        storage.saveEntry(action.value).then(function(entry) {
          state.inRequest = false;
          Store.dispatch({
            type : "SAVE_ANSWER",
            value : entry,
            success : action.success
          });
        }).catch(function(error) {
          errorHandler(error, state);
        });
        break;
      case "SAVE_ANSWER":
        state.entries[action.value.id] = action.value;
        if (!action.success) {
          state.error = "Wrong answer";
        } else {
          state.success = true;
        }
        break;
      case "ERROR":
        state.error = action.value;
        break;
    }
    
    if (!suppressInRequest) {
      state.inRequest = false;
    }

    return state;

  };

  win.initStore = function(readyStorage) {
    storage = readyStorage;
    win.Store = VerySimpleRedux.createStore(appReducer);
  };

}(window));
