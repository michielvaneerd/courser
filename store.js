(function(win) {

	var defaultState = {
	  inRequest : false,
    courseId : 0,
    screen : null,
    courses : {}
  };
  
  var storage = win.Storage;

	var appReducer = function(state, action) {

    if (typeof state === "undefined") {
      return defaultState;
    }

    switch (action.type) {
      case "SELECT_COURSES":
        storage.getCourses().then(function(courses) {
          state.courses = courses;
          Store.dispatch({
            type : "SELECT_COURSE"
          });
        });
        break;
      case "SELECT_COURSE":
      	state.courseId = action.value;
      	state.screen = state.courseId ? "COURSE_SCREEN" : null;
        break;
      case "REQUEST_SAVE_COURSE":
        storage.saveCourse(action.value).then(function(course) {
          Store.dispatch({
            type : "SAVE_COURSE",
            value : course
          });
        });
        break;
      case "SAVE_COURSE":
        state.courseId = action.value.id;
        state.courses[state.courseId] = action.value;
        break;
      case "SHOW_COURSE_SCREEN":
      	state.screen = "COURSE_SCREEN";
      	break;
      case "DELETE_COURSE":
      	delete state.courses[state.courseId];
      	state.screen = null;
      	state.courseId = 0;
      	break;
    }

    return state;

  };
  
  win.Store = VerySimpleRedux.createStore(appReducer);

}(window));