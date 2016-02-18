(function(win) {

	var defaultState = {
    courseId : 0,
    screen : null,
    courses : {
    	1 : {
    		id : 1,
    		title : "Test 1"
    	},
    	2 : {
    		id : 2,
    		title : "Test 2"
    	}
    }
  };

	var appReducer = function(state, action) {

    if (typeof state === "undefined") {
      return defaultState;
    }

    switch (action.type) {
      case "SELECT_COURSE":
      	state.courseId = action.value;
      	state.screen = state.courseId ? "COURSE_SCREEN" : null;
        break;
      case "SAVE_COURSE":
      	if (!state.courseId) {
      		state.courseId = Object.keys(state.courses).length
      			? Math.max.apply(null, Object.keys(state.courses)) + 1 : 1;
      		state.courses[state.courseId] = Object.assign({id : state.courseId}, action.value);
      	}
      	state.courses[state.courseId] = Object.assign({},
      		state.courses[state.courseId], action.value);
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