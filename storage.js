(function(win) {
  
  // Also prefix for localStorage items
  // Each course has ites own item, that way you can easily share a course.
  var storageName = "courser";
  var storageCoursePrefix = "courser_course_";
  
  var saveStorage = function(storage) {
    win.localStorage.setItem(storageName, JSON.stringify(storage));
  };
  
  var _saveCourse = function(course) {
    win.localStorage.setItem(storageCoursePrefix + course.id, JSON.stringify(course));
  };
  
  var _deleteCourse = function(id) {
    win.localStorage.removeItem(storageCoursePrefix + id);
  };
  
  var _getCourse = function(id) {
    return getStorageItem(storageCoursePrefix + id);
  };
  
  var getStorageItem = function(key) {
    var item = win.localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return null;
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
  
  var _getCourses = function() {
    var courses = {};
    Object.keys(localStorage).forEach(function(key) {
      if (key.startsWith(storageCoursePrefix)) {
        var course = getStorageItem(key);
        courses[course.id] = course;
      }
    });
    return courses;
  };

  win.Storage = {
    
    getStorage : getStorage,
    saveStorage : saveStorage,
    
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
      var courses = _getCourses();
      Object.keys(courses).forEach(function(courseId) {
        var course = courses[courseId];
        var courseEntries = course.entries;
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
        var courses = _getCourses();
        course.id = Object.keys(courses).length
          ? Math.max.apply(null, Object.keys(courses)) + 1 : 1;
        course.entries = {};
      }
      course.count = course.count || 0;
      _saveCourse(course);
      return Promise.resolve(course);
    },

    deleteCourse : function(id) {
      _deleteCourse(id);
      return Promise.resolve();
    },
    
    resetCourse : function(courseId) {
      var course = _getCourse(courseId);
      var entries = course.entries;
      Object.keys(entries).forEach(function(entryId) {
        var entry = entries[entryId];
        entry.attempt_success = 0;
        entry.attempt_failure = 0;
      });
      _saveCourse(course);
      return Promise.resolve(course);
    },

    getEntries : function(courseId, onlyNonSuccess) {
      var course = _getCourse(courseId);
      var entries = course.entries;
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
      var realCourseId = entry.course_id
          ? parseInt(entry.course_id) : parseInt(courseId);
      var course = _getCourse(realCourseId);
      var entries = course.entries;
      if (!entry.id) {
        entry.id = Object.keys(entries).length
          ? Math.max.apply(null, Object.keys(entries)) + 1 : 1;
      }
      entry.course_id = realCourseId;
      entries[entry.id] = entry;
      _saveCourse(course);
      return Promise.resolve(entry);
    },

    deleteEntry : function(entryId, courseId) {
      var course = _getCourse(courseId);
      var entries = course.entries;
      delete entries[entryId];
      _saveCourse(course);
      return Promise.resolve();
    }
    
  };

}(window));
