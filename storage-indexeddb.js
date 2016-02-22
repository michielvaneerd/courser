(function(win) {

  var db = null;

  win.StorageDB = {
  
    ready : function() {
      return new Promise(function(resolve, reject) {
        var req = indexedDB.open("langlearn", 3);
        req.onerror = function(e) {
          reject(e.target.error);
        };
        req.onsuccess = function(e) {
          db = e.target.result;
          resolve(e.target.result);
        };
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          // TODO: handle old data
          if (db.objectStoreNames.contains("course")) {
            db.deleteObjectStore("course");
          }
          if (db.objectStoreNames.contains("entry")) {
            db.deleteObjectStore("entry");
          }
          var courseStore = db.createObjectStore("course",
            {keyPath : "id", autoIncrement : true});
          var entryCourse = db.createObjectStore("entry",
            {keyPath : "id", autoIncrement : true});
          entryCourse.createIndex("ind_course_id",
            "course_id",
            {unique : false});
          entryCourse.createIndex("ind_attempt_success",
            ["course_id", "attempt_success"],
            {unique : false});
        };
      });
    },
    
    // Not sure if it's better to open a db connection for each command
    // or just rely on the global one as a transaction is only valid while
    // not returning to the event loop.
    // See: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#Adding_data_to_the_database
    //getCourses : function() {
    //  var me = this;
    //  return me.ready()
    //    .then(function(db) {
    //      return me.getCoursesOld(db);
    //    });
    //},
    
    // Also get count of entries per course
    // Use cursor on index ind_course_id, as this will sort entries on the index
    getCourses : function() {
      return new Promise(function(resolve, reject) {
        var transaction = db.transaction(["course", "entry"]);
        var entryCursor = null;
        transaction.oncomplete = function() {
          console.log(courses);
          resolve(courses);
        };
        transaction.onerror = reject;
        var courses = {};
        transaction.objectStore("course").openCursor().onsuccess = function(e) {
          var courseCursor = e.target.result;
          if (courseCursor) {
            courses[courseCursor.key] = courseCursor.value;
            courses[courseCursor.key].count = 0;
            courses[courseCursor.key].count_attempt_success = 0;
            courseCursor.continue();
          } else {
            transaction.objectStore("entry").index("ind_course_id").openCursor().onsuccess = function(e) {
              var entryCursor = e.target.result;
              if (entryCursor) {
                courses[entryCursor.key].count += 1;
                if (entryCursor.value.attempt_success > 0) {
                  courses[entryCursor.key].count_attempt_success += 1;
                }
                entryCursor.continue();
              }
            };
          }
        };
        
      });
    },
    
    saveCourse : function(course) {
      return new Promise(function(resolve, reject) {
        var transaction = db.transaction(["course"], "readwrite");
        transaction.oncomplete = function(e) {
          resolve(course);
        };
        var store = transaction.objectStore("course");
        var request = store.put(course);
        request.onerror = reject;
        request.onsuccess = function(e) {
          course.id = e.target.result;
          course.count = course.count || 0;
        };
      });
    },
    
    deleteCourse : function(id) {
      return new Promise(function(resolve, reject) {
        var transaction = db.transaction(["course", "entry"], "readwrite");
        //transaction.oncomplete = function() {
        //  console.log("complete delete transaction");
        //};
        var entryStore = transaction.objectStore("entry");
        var entryIndex = entryStore.index("ind_course_id");
        var entryRange = IDBKeyRange.only(parseInt(id));
        var entryRequest = entryIndex.openKeyCursor(entryRange);
        entryRequest.onsuccess = function() {
          var cursor = entryRequest.result;
          if (cursor) {
            entryStore.delete(cursor.primaryKey);
            cursor.continue();
          } else {
            var store = transaction.objectStore("course");
            var request = store.delete(parseInt(id));
            request.onsuccess = resolve;
            request.onerror = reject;
          }
        };
      });
    },
    
    getEntries : function(courseId, onlyNonSuccess) {
      courseId = parseInt(courseId);
      return new Promise(function(resolve, reject) {
        var transaction = db.transaction(["entry"]);
        var store = transaction.objectStore("entry");
        var index, range = null;
        if (onlyNonSuccess) {
          index = store.index("ind_attempt_success");
          range = IDBKeyRange.only([courseId, 0]);
        } else {
          index = store.index("ind_course_id");
          range = IDBKeyRange.only(courseId);
        }
        var request = index.openCursor(range);
        var entries = {};
        request.onsuccess = function(e) {
          var cursor = e.target.result;
          if (cursor) {
            entries[cursor.value.id] = cursor.value;
            cursor.continue();
          } else {
            console.log(entries);
            resolve(entries);
          }
        };
        request.onerror = reject;
      });
    },
    
    saveEntry : function(entry, courseId) {
      // New entries have an id of 0 and will cause indexedDB to prevent the
      // auto increment, so we have to delete it.
      if (("id" in entry) && !entry.id) {
        delete entry.id;
      }
      return new Promise(function(resolve, reject) {
        entry.course_id = entry.course_id
          ? parseInt(entry.course_id) : parseInt(courseId);
        var transaction = db.transaction(["entry"], "readwrite");
        transaction.oncomplete = function(e) {
          resolve(entry);
        };
        var store = transaction.objectStore("entry");
        var request = store.put(entry);
        request.onerror = reject;
        request.onsuccess = function(e) {
          entry.id = e.target.result;
        };
      });
    },
    
    deleteEntry : function(entryId, courseId) {
      return new Promise(function(resolve, reject) {
        var transaction = db.transaction(["entry"], "readwrite");
        transaction.oncomplete = function() {
          //
        };
        var store = transaction.objectStore("entry");
        var request = store.delete(parseInt(entryId));
        request.onsuccess = resolve;
        request.onerror = reject;
      });
    }
    
  };
  

}(window));
