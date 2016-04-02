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
    "SOURCE_DESTINATION_CHOOSE" : "Show %source%, select %destination%",
    "DESTINATION_SOURCE_CHOOSE" : "Show %destination%, select %source%",
    "SOURCE_DESTINATION_WRITE" : "Show %source%, type %destination%",
    "DESTINATION_SOURCE_WRITE" : "Show %destination%, type %source%"
  };

	var defaultState = {
	  success : false,
    sortOrder : null,
	  inRequest : false,
    error : false,
    courseId : 0,
    entryId : 0,
    screen : null,
    courses : {}, // courseId => course
    entries : {}, // entryId => entry (only for active course)
    entryIds : [], // to make sortable possible
    entriesOrder : "ID_ASC"
  };
  
  var localStorageName = "courser_store";
  
  var getStateFromLocalStorage = function() {
    var item = win.localStorage.getItem(localStorageName);
    if (item) {
      return JSON.parse(item);
    }
    return defaultState;
  };
  
  var setStateToLocalStorage = function(state) {
    win.localStorage.setItem(localStorageName, JSON.stringify(state));
  };
  
  var storage = null;
  var dropbox = null;
  
  var errorHandler = function(error, state) {
    state.inRequest = false;
    Store.dispatch({
      type : "ERROR",
      value : error.toString()
    });
  };
  
  var sortEntries = function(entries, entriesOrder) {
    switch (entriesOrder) {
      case "ID_DESC":
        return Object.keys(entries).sort(function(a, b) {
          return b - a;
        }).map(function(id) {
          return parseInt(id);
        });
      break;
      case "ALPHABETIC_SOURCE_ASC":
        return Object.keys(entries).sort(function(a, b) {
          if (entries[a].source > entries[b].source) {
            return 1;
          }
          if (entries[a].source < entries[b].source) {
            return -1;
          }
          return 0;
        }).map(function(id) {
          return parseInt(id);
        });
      break;
      case "ALPHABETIC_SOURCE_DESC":
        return Object.keys(entries).sort(function(a, b) {
          if (entries[a].source < entries[b].source) {
            return 1;
          }
          if (entries[a].source > entries[b].source) {
            return -1;
          }
          return 0;
        }).map(function(id) {
          return parseInt(id);
        });
      break;
      case "ALPHABETIC_DESTINATION_ASC":
        return Object.keys(entries).sort(function(a, b) {
          if (entries[a].destination > entries[b].destination) {
            return 1;
          }
          if (entries[a].destination < entries[b].destination) {
            return -1;
          }
          return 0;
        }).map(function(id) {
          return parseInt(id);
        });
      break;
      case "ALPHABETIC_DESTINATION_DESC":
        return Object.keys(entries).sort(function(a, b) {
          if (entries[a].destination < entries[b].destination) {
            return 1;
          }
          if (entries[a].destination > entries[b].destination) {
            return -1;
          }
          return 0;
        }).map(function(id) {
          return parseInt(id);
        });
      break;
      default:
        return Object.keys(entries).sort().map(function(id) {
          return parseInt(id);
        });
      break;
    }
    return entryIds;
  };

	var appReducer = function(state, action) {
    
    console.log(action.type);

    if (typeof state === "undefined") {
      return getStateFromLocalStorage();
    }
    
    if (state.inRequest) {
      console.warn("In request!");
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
	  
	  state.inRequest = true;
	  var keepInRequest = false;

    switch (action.type) {
      case "SELECT_COURSES":
        if (action.value) {
          state.courses = action.value;
          state.courseId = 0;
          state.entryId = 0;
          state.screen = null;
        } else {
          keepInRequest = true;
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
      	state.screen = state.courseId ? "COURSE_ACTION_SCREEN" : null;
        break;
      case "CREATE_COURSE":
      	state.screen = "COURSE_EDIT_SCREEN";
      	break;
      case "SELECT_COURSE_EDIT":
        state.screen = "COURSE_EDIT_SCREEN";
        break;
      case "REQUEST_DO_SHUFFLE":
        keepInRequest = true;
        storage.getEntries(action.value).then(function(entries) {
          state.inRequest = false;
          state.courseId = action.value;
          me.dispatch({
            type : "DO_SHUFFLE",
            value : entries
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
        keepInRequest = true;
        storage.getEntries(action.value).then(function(entries) {
          state.inRequest = false;
          state.courseId = action.value;
          me.dispatch({
            type : "SELECT_ENTRIES",
            value : entries
          });
        }).catch(function(error) {
          errorHandler(error, state);
        });
        break;
      case "SELECT_ENTRIES":
        state.entryId = 0;
        // TODO: sort in storage, for now I do it here...
        state.entries = action.value;
        state.entryIds = sortEntries(action.value, state.entriesOrder);
        state.screen = "ENTRIES_SCREEN";
        break;
      case "REQUEST_SAVE_COURSE":
        if (!action.value.title || action.value.title.length == 0) {
          state.error = "Enter title";
        } else {
          keepInRequest = true;
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
        state.screen = "COURSE_ACTION_SCREEN";
        break;
      case "SELECT_ENTRY":
        state.entryId = action.value;
        break;
      case "REQUEST_SAVE_ENTRY":
        keepInRequest = true;
        storage.saveEntry(action.value, state.courseId).then(function(entry) {
          state.inRequest = false;
          me.dispatch({
            type : "SAVE_ENTRY",
            value : entry
          });
        }).catch(function(error) {
          errorHandler(error, state);
        });
        break;
      case "SAVE_ENTRY":
        state.entries[action.value.id] = action.value;
        state.courses[state.courseId].count = Object.keys(state.entries).length;
        if (state.entryIds.indexOf(parseInt(action.value.id)) === -1) {
          // TODO: sort as entriesOrder!
          state.entryIds.push(parseInt(action.value.id));
        }
        state.entryId = 0;
        break;
      case "REQUEST_DELETE_ENTRY":
        keepInRequest = true;
        delete state.entries[state.entryId];
        state.entryIds.splice(state.entryIds.indexOf(parseInt(state.entryId)), 1);
        storage.deleteEntry(state.entryId, state.courseId).then(function() {
          state.inRequest = false;
          me.dispatch({
            type : "DELETE_ENTRY"
          });
        }).catch(function(error) {
          errorHandler(error, state);
        });
        break;
      case "DELETE_ENTRY":
        state.courses[state.courseId].count -= 1;
        state.entryId = 0;
        break;
      case "ENTRIES_ORDER":
        state.entriesOrder = action.value;
        state.entryIds = sortEntries(state.entries, state.entriesOrder);
        break;
      case "REQUEST_DELETE_COURSE":
        keepInRequest = true;
        // Simulate long during action:
        setTimeout(function() {
          return storage.deleteCourse(state.courseId).then(function() {
            state.inRequest = false;
          })
          .then(function() {
            var course = me.state.courses[me.state.courseId];
            return dropbox.delete("/" + course.filename + ".json");
          })
          .then(function() {
            me.dispatch({
              type : "DELETE_COURSE"
            });
          })
          .catch(function(error) {
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
        keepInRequest = true;
        storage.resetCourse(state.courseId).then(function(course) {
          state.inRequest = false;
          state.courses[state.courseId].count_attempt_success = 0;
          state.courses[state.courseId].count_attempt_failure = 0;
          me.dispatch({
            type : "REQUEST_DO_COURSE",
            value : state.courseId,
            testEntryId : action.entryId,
            testAnswerEntryIds : action.entryIds,
            testType : action.testType
          });
        }).catch(function(error) {
          errorHandler(error, state);
        });
        break;
      case "REQUEST_DO_COURSE":        
        keepInRequest = true;
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
            value : entries
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
        keepInRequest = true;
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
            doCourseSuccess : action.doCourseSuccess
          });
        }).catch(function(error) {
          // TODO: revert what you did above.
          errorHandler(error, state);
        });
        break;
      case "DROPBOX_CONNECT":
        dropbox.authorize();
        break;
      case "DROPBOX_SAVE":
        keepInRequest = true;
        var courses = storage._getCourses();
        var requests = [];
        Object.keys(courses).forEach(function(courseId) {
          var course = courses[courseId];
          requests.push(dropbox.upload("/" + course.filename + ".json",
            JSON.stringify(course)));
        });
        Promise.all(requests).then(function() {
          state.inRequest = false;
          me.dispatch({
            type : "SELECT_COURSES"
          });
        }).catch(function(error) {
          state.inRequest = false;
          console.log(error);
        });
        break;
      case "DROPBOX_DISCONNECT":
        win.localStorage.removeItem("access_token");
        state.dropboxAccount = null;
        break;
      case "REQUEST_DROPBOX_ACCOUNT":
        keepInRequest = true;
        dropbox.getCurrentAccount().then(function(response) {
          state.dropboxAccount = response;
          if (localStorage.getItem("courser_cursor")) {
            return dropbox.listFolderContinue(localStorage.getItem("courser_cursor"));
          } else {
            return dropbox.listFolder("");
          }
        }).then(function(response) {
          if (response.cursor) {
            localStorage.setItem("courser_cursor", response.cursor)
          }
          var downloadRequests = [];
          response.entries.forEach(function(entry) {
            if (entry.path_lower.startsWith("/" + storage.storageCoursePrefix)) {
              if (entry[".tag"] !== "deleted") {
                downloadRequests.push(dropbox.download(entry.path_lower));
              }
            }
          });
          return Promise.all(downloadRequests);
        })
        .then(function(responses) {
          var saveCourseRequests = [];
          responses.forEach(function(response) {
            saveCourseRequests.push(storage.saveCourse(JSON.parse(response.content)));
          });
          return Promise.all(saveCourseRequests);
        })
        .then(function() {
          state.inRequest = false;
          me.dispatch({
            type : "SELECT_COURSES"
          });
        })
        .catch(function(error) {
          state.inRequest = false;
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
    
    if (!keepInRequest) {
      state.inRequest = false;
    }
    
    if (!state.inRequest && !state.warning && !state.error && !state.success) {
      setStateToLocalStorage(state);
    }
    return state;

  };
  
  win.getDefaultState = getStateFromLocalStorage;

  win.initStore = function(readyStorage, DP) {
    storage = readyStorage;
    dropbox = DP;
    win.Store = VerySimpleRedux.createStore(appReducer);
  };

}(window));
