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
    entriesMenuShow : false,
    coursesListMenuShow : false,
    courseActionMenuShow : false,
    shuffleMenuShow : false,
    doCourseMenuShow : false,
    entriesFilter : "",
	  inRequest : false,
    error : false,
    courseId : 0,
    entryId : 0,
    screen : null,
    courses : {}, // courseId => course
    entries : {}, // entryId => entry (only for active course)
    entryIds : [], // to make sortable possible
    entriesOrder : "ID_ASC",
    sharedLink : ""
  };
  
  var localStorageName = "courser_store";
  
  var getStateFromLocalStorage = function() {
    var item = win.localStorage.getItem(localStorageName);
    if (item) {
      return Object.assign({}, defaultState, JSON.parse(item));
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
      value : error.error || error.toString()
    });
  };
  
  var sortEntries = function(entries, entriesOrder, entriesFilter) {
    var hasEntriesFilter = entriesFilter.length !== 0;
    entriesFilter = entriesFilter.toLowerCase();
    switch (entriesOrder) {
      case "ID_DESC":
        return Object.keys(entries)
          .filter(function(id) {
            if (!hasEntriesFilter) return true;
            return entries[id].source.toLowerCase().indexOf(entriesFilter) > -1
              ||
              entries[id].destination.toLowerCase().indexOf(entriesFilter) > -1
              ||
              (entries[id].phone && entries[id].phone.toLowerCase().indexOf(entriesFilter) > -1);
          })
          .sort(function(a, b) {
            return b - a;
          }).map(function(id) {
            return parseInt(id);
          });
      case "ALPHABETIC_SOURCE_ASC":
        return Object.keys(entries)
          .filter(function(id) {
            if (!hasEntriesFilter) return true;
            return entries[id].source.toLowerCase().indexOf(entriesFilter) > -1
              ||
              entries[id].destination.toLowerCase().indexOf(entriesFilter) > -1
              ||
              (entries[id].phone && entries[id].phone.toLowerCase().indexOf(entriesFilter) > -1);
          })
          .sort(function(a, b) {
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
      case "ALPHABETIC_SOURCE_DESC":
        return Object.keys(entries)
          .filter(function(id) {
            if (!hasEntriesFilter) return true;
            return entries[id].source.toLowerCase().indexOf(entriesFilter) > -1
              ||
              entries[id].destination.toLowerCase().indexOf(entriesFilter) > -1
              ||
              (entries[id].phone && entries[id].phone.toLowerCase().indexOf(entriesFilter) > -1);
          })
          .sort(function(a, b) {
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
      case "ALPHABETIC_DESTINATION_ASC":
        return Object.keys(entries)
          .filter(function(id) {
            if (!hasEntriesFilter) return true;
            return entries[id].source.toLowerCase().indexOf(entriesFilter) > -1
              ||
              entries[id].destination.toLowerCase().indexOf(entriesFilter) > -1
              ||
              (entries[id].phone && entries[id].phone.toLowerCase().indexOf(entriesFilter) > -1);
          })
          .sort(function(a, b) {
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
      case "ALPHABETIC_DESTINATION_DESC":
        return Object.keys(entries)
          .filter(function(id) {
            if (!hasEntriesFilter) return true;
            return entries[id].source.toLowerCase().indexOf(entriesFilter) > -1
              ||
              entries[id].destination.toLowerCase().indexOf(entriesFilter) > -1
              ||
              (entries[id].phone && entries[id].phone.toLowerCase().indexOf(entriesFilter) > -1);
          })
          .sort(function(a, b) {
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
      default:
        return Object.keys(entries)
          .filter(function(id) {
            if (!hasEntriesFilter) return true;
            return entries[id].source.toLowerCase().indexOf(entriesFilter) > -1
              ||
              entries[id].destination.toLowerCase().indexOf(entriesFilter) > -1
              ||
              (entries[id].phone && entries[id].phone.toLowerCase().indexOf(entriesFilter) > -1);
          })
          .sort(function(a, b) {
            return a - b;
          }).map(function(id) {
            return parseInt(id);
          });
    }
  };
  
  var dropboxReducer = function(state, action) {
    var me = this;
    switch (action.type) {
      case "DROPBOX_CONNECT":
        dropbox.authorize();
        break;
      case "DROPBOX_SAVE":
        state.keepInRequest = true;
        state.inRequest = "Saving to Dropbox...";
        var courses = storage._getCourses();
        var requests = [];
        Object.keys(courses).forEach(function(courseId) {
          var course = courses[courseId];
          if (course.hasLocalChange) {
            console.log("save course " + course.title);
            // TODO: if Dropbox save did not succees, we have lost the hasLocalChange!
            delete course.hasLocalChange;
            requests.push(dropbox.upload("/" + course.filename + ".json",
              JSON.stringify(course)));
          } else {
            console.log("SKIP course " + course.title);
          }
        });
        Promise.all(requests).then(function(responses) {
          var coursesSave = [];
          Object.keys(courses).forEach(function(courseId) {
            var i;
            var course = courses[courseId];
            if (!course.dropbox_id) {
              for (i = 0; i < responses.length; i++) {
                if (("/" + course.filename + ".json") === responses[i].path_lower) {
                  course.dropbox_id = responses[i].id;
                  //coursesSave.push(storage.saveCourse(course));
                }
              }
            }
            coursesSave.push(storage.saveCourse(course));
          });
          return Promise.all(coursesSave);
        })
        .then(function() {
          state.inRequest = false;
          me.dispatch({
            type : "SELECT_COURSES"
          });
        })
        .catch(function(error) {
          state.inRequest = false;
          console.log(error);
        });
        break;
      case "DROPBOX_DISCONNECT":
        win.localStorage.removeItem("access_token");
        state.dropboxAccount = null;
        break;
      case "REQUEST_ADD_COURSE_FROM_SHARED_LINK":
        state.keepInRequest = true;
        state.inRequest = "Getting course from shared link...";
        dropbox.getSharedLinkFile(action.value)
          .then(function(response) {
            var course = JSON.parse(response.content);
            course.dropbox_id = response.apiResult.id;
            return storage.saveCourse(course);
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
      case "REQUEST_SHARE_COURSE":
        state.keepInRequest = true;
        state.inRequest = "Requesting shared link...";
        var course = state.courses[state.courseId];
        dropbox.createSharedLink("/" + course.filename + ".json")
          .then(function(response) {
            state.inRequest = false;
            me.dispatch({
              type : "SHARE_COURSE",
              value : response.url
            });
          })
          .catch(function(error) {
            state.inRequest = false;
            errorHandler(error, state);
          });
        break;
      case "SHARE_COURSE":
        state.sharedLink = action.value || "";
        break;
      case "REQUEST_DROPBOX_ACCOUNT":
        state.keepInRequest = true;
        state.inRequest = "Requesting Dropbox info...";
        dropbox.getCurrentAccount().then(function(response) {
          state.dropboxAccount = response;
          if (localStorage.getItem("courser_cursor")) {
            return dropbox.listFolderContinue(localStorage.getItem("courser_cursor"))
              .catch(function(error) {
                if (error.status == 400 || error.tag == "reset") {
                  localStorage.removeItem("courser_cursor");
                  return dropbox.listFolder("");
                } else {
                  return Promise.reject(error);
                }
              });
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
            var course = JSON.parse(response.content);
            delete course.hasLocalChange;
            course.dropbox_id = response.apiResult.id;
            saveCourseRequests.push(storage.saveCourse(course));
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
    }
  };

	var appReducer = function(state, action) {

    if (typeof state === "undefined") {
      return getStateFromLocalStorage();
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
    
    if (action.type != "SHARE_COURSE") {
      state.sharedLink = "";
    }
	  
	  state.inRequest = true;
	  state.keepInRequest = false;

    switch (action.type) {
      case "ESC_TYPED":
        state.entriesMenuShow = false;
        state.coursesListMenuShow = false;
        state.courseActionMenuShow = false;
        state.shuffleMenuShow = false;
        state.doCourseMenuShow = false;
        break;
      case "SHOW_COURSESLIST_MENU":
        state.coursesListMenuShow = action.value || false;
        break;
      case "SHOW_COURSEACTION_MENU":
        state.courseActionMenuShow = action.value || false;
        break;
      case "SHOW_ENTRIES_MENU":
        state.entriesMenuShow = action.value || false;
        break;
      case "SHOW_SHUFFLE_MENU":
        state.shuffleMenuShow = action.value || false;
        break;
      case "SHOW_DOCOURSE_MENU":
        state.doCourseMenuShow = action.value || false;
        break;
      case "ENTRIES_FILTER":
        state.entriesFilter = action.value;
        state.entryIds = sortEntries(state.entries, state.entriesOrder, state.entriesFilter);
        break;
      case "SELECT_COURSES":
        if (action.value) {
          state.courses = action.value;
          state.courseId = 0;
          state.entryId = 0;
          state.screen = null;
        } else {
          state.keepInRequest = true;
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
        state.keepInRequest = true;
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
        state.keepInRequest = true;
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
        state.entryIds = sortEntries(state.entries, state.entriesOrder, state.entriesFilter);
        state.screen = "ENTRIES_SCREEN";
        break;
      case "REQUEST_SAVE_COURSE":
        if (!action.value.title || action.value.title.length == 0) {
          state.error = "Enter title";
        } else {
          state.keepInRequest = true;
          action.value.hasLocalChange = true;
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
        state.keepInRequest = true;
        state.courses[state.courseId].hasLocalChange = true;
        
        storage.saveCourse(state.courses[state.courseId])
          .then(function() {
            return storage.saveEntry(action.value, state.courseId);
          })
          .then(function(entry) {
            state.inRequest = false;
            me.dispatch({
              type : "SAVE_ENTRY",
              value : entry
            });
          })
          .catch(function(error) {
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
        state.keepInRequest = true;
        delete state.entries[state.entryId];
        state.entryIds.splice(state.entryIds.indexOf(parseInt(state.entryId)), 1);
        
        state.courses[state.courseId].hasLocalChange = true;
        
        storage.saveCourse(state.courses[state.courseId])
          .then(function() {
            return storage.deleteEntry(state.entryId, state.courseId);
          })
          .then(function() {
            state.inRequest = false;
            me.dispatch({
              type : "DELETE_ENTRY"
            });
          })
          .catch(function(error) {
            errorHandler(error, state);
          });
        break;
      case "DELETE_ENTRY":
        state.courses[state.courseId].count -= 1;
        state.entryId = 0;
        break;
      case "ENTRIES_ORDER":
        state.entriesOrder = action.value;
        state.entryIds = sortEntries(state.entries, state.entriesOrder, state.entriesFilter);
        break;
      case "REQUEST_DELETE_COURSE":
        state.keepInRequest = true;
        storage.deleteCourse(state.courseId).then(function() {
          var course = me.state.courses[state.courseId];
          if (course.dropbox_id) {
            if (state.dropboxAccount && navigator.onLine) {
              return dropbox.delete("/" + course.filename + ".json");
            } else {
              // We have deleted a course local, but in Dropbox it is still available.
              // So invalidate the cursor, so next time we will download the course again.
              localStorage.removeItem("courser_cursor");
              dropbox.cursor
              return Promise.resolve();
            }
          } else {
            return Promise.resolve();
          }
        })
        .then(function() {
          state.inRequest = false;
          me.dispatch({
            type : "DELETE_COURSE"
          });
        })
        .catch(function(error) {
          state.inRequest = false;
          errorHandler(error, state);
        });
        break;
      case "DELETE_COURSE":
      	delete state.courses[state.courseId];
      	state.screen = null;
      	state.courseId = 0;
      	break;
      case "REQUEST_RESET":
        state.keepInRequest = true;
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
        state.keepInRequest = true;
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
        state.keepInRequest = true;
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
      case "ERROR":
        state.error = action.value;
        break;
      case "SUCCESS":
        state.success = action.value;
        break;
      case "WARNING":
        state.warning = action.value;
        break;
      default:
        dropboxReducer.call(me, state, action);
        break;
    }
    
    if (!state.keepInRequest) {
      state.inRequest = false;
    }
    
    if (!state.inRequest && !state.warning && !state.error && !state.success) {
      setStateToLocalStorage(Object.assign({}, state, {screen : null}));
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
