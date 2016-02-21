(function(win) {

  var db = null;

  win.StorageDB = {
  
    ready : function() {
      return new Promise(function(resolve, reject) {
        var req = indexedDB.open("langlearn", 2);
        req.onerror = function(e) {
          reject(e.target.error);
        };
        req.onsuccess = function(e) {
          db = e.target.result;
          resolve();
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
          entryCourse.createIndex("ind_course_id", "course_id",
            {unique : false});
        };
      });
    },
    
    getCourses : function() {
      return new Promise(function(resolve, reject) {
        var transaction = db.transaction(["course"]);
        var store = transaction.objectStore("course");
        var request = store.openCursor();
        var courses = {};
        request.onsuccess = function(e) {
          var cursor = e.target.result;
          if (cursor) {
            courses[cursor.key] = cursor.value;
            cursor.continue();
          } else {
            resolve(courses);
          }
        };
        request.onerror = reject;
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
        };
      });
    },
    
    deleteCourse : function(id) {
      return new Promise(function(resolve, reject) {
        var transaction = db.transaction(["course"], "readwrite");
        //transaction.oncomplete = function() {
        //  console.log("complete delete transaction");
        //};
        // TODO: delete all entries.
        var store = transaction.objectStore("course");
        var request = store.delete(parseInt(id));
        request.onsuccess = resolve;
        request.onerror = reject;
      });
    },
    
    getEntries : function(courseId) {
      return new Promise(function(resolve, reject) {
        var transaction = db.transaction(["entry"]);
        var store = transaction.objectStore("entry");
        var index = store.index("ind_course_id");
        var range = IDBKeyRange.only(parseInt(courseId));
        var request = index.openCursor(range);
        var entries = {};
        request.onsuccess = function(e) {
          var cursor = e.target.result;
          if (cursor) {
            entries[cursor.value.id] = cursor.value;
            cursor.continue();
          } else {
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
        entry.course_id = parseInt(courseId);
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
