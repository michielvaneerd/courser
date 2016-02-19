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

  // courseId => entryId => entry
  var entries = {
    1 : {
      1 : {
        id : 1,
        src : "Jiao",
        dest : "Heten"
      },
      2 : {
        id : 2,
        src : "Wo",
        dest : "Ik"
      }
    }
  };

  win.Storage = {
  
    getCourses : function() {
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          resolve(courses);
        }, 400);
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
    },

    deleteCourse : function(id) {
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          delete courses[id];
          resolve();
        }, 500);
      });
    },

    getEntries : function(courseId) {
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          var courseEntries = entries[courseId] || {};
          resolve(courseEntries);
        }, 300);
      });
    },

    saveEntry : function(entry, courseId) {
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          if (!(courseId in entries)) {
            entries[courseId] = {};
          }
          if (!entry.id) {
            entry.id = Object.keys(entries[courseId]).length
              ? Math.max.apply(null, Object.keys(entries[courseId])) + 1 : 1;
          }
          entries[courseId][entry.id] = Object.assign({id : entry.id}, entry);
          resolve(entries[courseId][entry.id]);
        }, 200);
      });
    },

    deleteEntry : function(entryId, courseId) {
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          delete entries[courseId][entryId];
          resolve();
        }, 200);
      });
    }
    
  };

}(window));
