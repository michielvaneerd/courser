(function(win) {

  // Constants - maybe separate file...
  win.Constants = {
    testTypes : [
      "SOURCE_DESTINATION_CHOOSE",
      "DESTINATION_SOURCE_CHOOSE",
      "SOURCE_DESTINATION_WRITE",
      "DESTINATION_SOURCE_WRITE"
    ]
  };
  
  win.Language = {
    "SOURCE_DESTINATION_CHOOSE" : "Show %source% item, select one of 4 possible %destination% items",
    "DESTINATION_SOURCE_CHOOSE" : "Show %destination% item, select one of 4 possible %source% items",
    "SOURCE_DESTINATION_WRITE" : "Show %source% item, enter %destination%",
    "DESTINATION_SOURCE_WRITE" : "Show %destination% item, enter %source%"
  };

	var defaultState = {
	  success : false,
    sortOrder : null,
	  inRequest : false,
    error : false,
    courseId : 0,
    forceBackToMainScreen : false,
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
      state.warning = "In request...";
	    return state;
	  }
	  
	  var me = this;

    if (action.type != "ERROR") {
      state.error = false;
    }
    if (action.type != "WARNING") {
      state.warning = false;
    }
    
    if (action.type != "SUCCESS") {
      state.success = false;
    }
    
    if (action.type != "ERROR" && action.type != "SUCCESS") {
      state.forceBackToMainScreen = action.forceBackToMainScreen;
    }
	  
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
            me.dispatch({
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
      case "REQUEST_DO_SHUFFLE":
        suppressInRequest = true;
        storage.getEntries(action.value).then(function(entries) {
          state.inRequest = false;
          state.courseId = action.value;
          me.dispatch({
            type : "DO_SHUFFLE",
            value : entries,
            forceBackToMainScreen : action.forceBackToMainScreen
          });
        }).catch(function(error) {
          errorHandler(error, state);
        });
        break;
      case "DO_SHUFFLE":
        state.entryId = 0;
        state.entries = action.value;
        state.screen = "SHUFFLE_SCREEN";
        break;
      case "REQUEST_SELECT_ENTRIES":
        suppressInRequest = true;
        storage.getEntries(action.value).then(function(entries) {
          state.inRequest = false;
          state.courseId = action.value;
          me.dispatch({
            type : "SELECT_ENTRIES",
            value : entries,
            forceBackToMainScreen : action.forceBackToMainScreen
          });
        }).catch(function(error) {
          errorHandler(error, state);
        });
        break;
      case "SELECT_ENTRIES":
        state.entryId = 0;
        state.entries = action.value;
        state.screen = "ENTRIES_SCREEN";
        break;
      case "REQUEST_SAVE_COURSE":
        if (!action.value.title || action.value.title.length == 0) {
          state.error = "Enter title";
        } else {
          suppressInRequest = true;
          storage.saveCourse(action.value).then(function(course) {
            state.inRequest = false;
            me.dispatch({
              type : "SAVE_COURSE",
              value : course
            });
          }).catch(function(error) {
            errorHandler(error, state);
          });
        }
        break;
      case "SAVE_COURSE":
        state.courseId = action.value.id;
        state.courses[state.courseId] = action.value;
        state.success = "OK";
        break;
      case "SELECT_ENTRY":
        state.entryId = action.value;
        break;
      case "REQUEST_SAVE_ENTRY":
        suppressInRequest = true;
        storage.saveEntry(action.value, state.courseId).then(function(entry) {
          state.inRequest = false;
          me.dispatch({
            type : "SAVE_ENTRY",
            value : entry,
            forceBackToMainScreen : action.forceBackToMainScreen
          });
        }).catch(function(error) {
          errorHandler(error, state);
        });
        break;
      case "SAVE_ENTRY":
        state.entries[action.value.id] = action.value;
        state.courses[state.courseId].count = Object.keys(state.entries).length;
        state.entryId = 0;
        break;
      case "REQUEST_DELETE_ENTRY":
        suppressInRequest = true;
        storage.deleteEntry(state.entryId, state.courseId).then(function() {
          state.inRequest = false;
          me.dispatch({
            type : "DELETE_ENTRY",
            forceBackToMainScreen : action.forceBackToMainScreen
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
        // Simulate long during action:
        setTimeout(function() {
          storage.deleteCourse(state.courseId).then(function() {
            state.inRequest = false;
            me.dispatch({
              type : "DELETE_COURSE"
            });
          }).catch(function(error) {
            errorHandler(error, state);
          });
        }, 1000);
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
          state.courses[state.courseId].count_attempt_success = 0;
          state.courses[state.courseId].count_attempt_failure = 0;
          me.dispatch({
            type : "REQUEST_DO_COURSE",
            value : state.courseId,
            testEntryId : action.entryId,
            testAnswerEntryIds : action.entryIds,
            testType : action.testType,
            forceBackToMainScreen : action.forceBackToMainScreen
          });
        }).catch(function(error) {
          errorHandler(error, state);
        });
        break;
      case "REQUEST_DO_COURSE":        
        suppressInRequest = true;
        storage.getEntries(action.value).then(function(entries) {
          state.inRequest = false;
          state.courseId = action.value;
          state.entries = entries;
          state.doCourseEntryId = action.testEntryId;
          state.doCourseAnswerEntryIds = action.testAnswerEntryIds;
          state.doCourseTestType = action.testType;
          state.doCourseSuccess = null;
          me.dispatch({
            type : "DO_COURSE",
            value : entries,
            forceBackToMainScreen : action.forceBackToMainScreen
          });
        }).catch(function(error) {
          errorHandler(error, state);
        });
        break;
      case "DO_COURSE":
        state.screen = "DO_COURSE_SCREEN";
        state.answerEntryId = 0;
        state.answer = "";
        break;
      case "DO_COURSE_NEW_RANDOM_ITEM":
        state.answerEntryId = 0;
        state.answer = "";
        state.doCourseSuccess = null; // false / true / null
        state.doCourseEntryId = action.entryId;
        state.doCourseAnswerEntryIds = action.answerEntryIds;
        state.doCourseTestType = action.testType;
        break;
      case "REQUEST_SAVE_ANSWER":
        // var doCourseEntry = Object.assign({}, state.entries[state.doCourseEntryId]);
        // Optimistically save of answer: first set local,
        // save to storage. Will mostly be okay,
        // but if it isn't, revert what you did here in the error handler
        // below. TODO.
        var doCourseEntry = state.entries[state.doCourseEntryId];
        if (action.doCourseSuccess) {
          doCourseEntry.attempt_success += 1;
          state.courses[state.courseId].count_attempt_success += 1;
        } else {
          doCourseEntry.attempt_failure += 1;
          state.courses[state.courseId].count_attempt_failure += 1;
        }
        suppressInRequest = true;
        state.answer = action.answer;
        state.answerEntryId = action.answerEntryId;
        state.doCourseSuccess = action.doCourseSuccess;
        storage.saveEntry(doCourseEntry).then(function(entry) {
          state.inRequest = false;
          me.dispatch({
            type : "SAVE_ANSWER",
            doCourseEntry : entry,
            answer : action.answer,
            answerEntryId : action.answerEntryId,
            doCourseSuccess : action.doCourseSuccess,
            forceBackToMainScreen : action.forceBackToMainScreen
          });
        }).catch(function(error) {
          // TODO: revert what you did above.
          errorHandler(error, state);
        });
        break;
      case "ERROR":
        state.error = action.value;
        break;
      case "SUCCESS":
        state.success = action.value;
        break;
      case "WARNING":
        state.warning = action.value;
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
