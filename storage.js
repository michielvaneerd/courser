(function(win) {
  
  var storageName = "courser";
  
  var saveStorage = function(storage) {
    win.localStorage.setItem(storageName, JSON.stringify(storage));
  };
    
  var getStorage = function() {
    var storage = win.localStorage.getItem(storageName);
    if (storage) {
      return JSON.parse(storage);
    }
    return {
      courses : {}, // courseid => object
      entries : {} // courseid => entryid => object
    }
  };

  win.Storage = {
    
    storage : null,
    
    ready : function() {
      var me = this;
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          me.storage = getStorage();
          resolve();
        }, 400);
      });
    },
  
    getCourses : function() {
      var courses = this.storage.courses;
      Object.keys(courses).forEach(function(courseId) {
        var course = courses[courseId];
        console.log(course);
        var courseEntries = this.storage.entries[courseId];
        course.count = Object.keys(courseEntries).length;
        course.count_attempt_success = 0;
        course.count_attempt_failure = 0;
        Object.keys(courseEntries).forEach(function(entryId) {
          if (courseEntries[entryId].attempt_success) {
            course.count_attempt_success += 1;
          }
          if (courseEntries[entryId].attempt_failure) {
            course.count_attempt_failure += 1;
          }
        });
      }, this);
      
      return Promise.resolve(courses);
    },
    
    saveCourse : function(course) {
      if (!course.id) {
        course.id = Object.keys(this.storage.courses).length
          ? Math.max.apply(null, Object.keys(this.storage.courses)) + 1 : 1;
        this.storage.entries[course.id] = {};
      }
      this.storage.courses[course.id] = course;
      saveStorage(this.storage);
      return Promise.resolve(course);
    },

    deleteCourse : function(id) {
      delete this.storage.entries[id];
      delete this.storage.courses[id];
      saveStorage(this.storage);
      return Promise.resolve();
    },
    
    resetCourse : function(courseId) {
      var entries = this.storage.entries[courseId];
      Object.keys(entries).forEach(function(entryId) {
        var entry = entries[entryId];
        entry.attempt_success = 0;
        entry.attempt_failure = 0;
      });
      saveStorage(this.storage);
      return Promise.resolve();
    },

    getEntries : function(courseId, onlyNonSuccess) {
      var entries = this.storage.entries[courseId];
      if (onlyNonSuccess) {
        Object.keys(entries).forEach(function(id) {
          if (entries[id].attempt_success) {
            delete entries[id];
          }
        });
      }
      return Promise.resolve(entries);
    },

    saveEntry : function(entry, courseId) {
      if (!entry.id) {
        entry.id = Object.keys(this.storage.entries[courseId]).length
          ? Math.max.apply(null, Object.keys(this.storage.entries[courseId])) + 1 : 1;
      }
      entry.course_id = entry.course_id
          ? parseInt(entry.course_id) : parseInt(courseId);
      this.storage.entries[entry.course_id][entry.id] = entry;
      saveStorage(this.storage);
      return Promise.resolve(entry);
    },

    deleteEntry : function(entryId, courseId) {
      delete this.storage.entries[courseId][entryId];
      saveStorage(this.storage);
      return Promise.resolve();
    }
    
  };

}(window));
