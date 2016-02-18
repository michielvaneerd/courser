(function(win) {

  var courses = {
    1 : {
      id : 1,
      title : "Test 1"
    },
    2 : {
      id : 2,
      title : "Test 2"
    }
  };

  win.Storage = {
  
    getCourses : function() {
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve(courses);
        }, 1000);
      });
    },
    
    saveCourse : function(course) {
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          if (!course.id) {
            course.id = Object.keys(courses).length
              ? Math.max.apply(null, Object.keys(courses)) + 1 : 1;
          }
          courses[course.id] = Object.assign({id : course.id}, course);
          resolve(courses[course.id]);
        }, 500);
      });
    }
    
  };

}(window));