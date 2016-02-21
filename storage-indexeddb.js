(function(win) {

  var db = null;

  win.StorageDB = {
  
    ready : function() {
      return new Promise(function(resolve, reject) {
        var req = indexedDB.open("langlearn", 1);
        req.onerror = function(e) {
          console.log("onerror", e);
          reject();
        };
        // Deze vuurt zowel bij upgrade als oude database
        req.onsuccess = function(e) {
          console.log("onsuccess", e);
          db = e.target.result;
          resolve();
        };
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          console.log("onupgradeneeded", e);
          // TODO: handle old data
          if (db.objectStoreNames.contains("course")) {
            console.log("Delete course store first");
            db.deleteObjectStore("course");
          }
          if (db.objectStoreNames.contains("entry")) {
            console.log("Delete entry store first");
            db.deleteObjectStore("entry");
          }
          var courseStore = db.createObjectStore("course", {keyPath : "id", autoIncrement : true});
          var entryCourse = db.createObjectStore("entry", {keyPath : "id", autoIncrement : true});
          entryCourse.createIndex("ind_course_id", "course_id", {unique : false});
          //store.transaction.oncomplete = function(e) {
          //  console.log("store.transaction.oncomplete", e);
          //  //resolve();
          //};
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
        request.onerror = function() {
          reject();
        };
      });
    },
    
    saveCourse : function(course) {
      return new Promise(function(resolve, reject) {
        var transaction = db.transaction(["course"], "readwrite");
        transaction.oncomplete = function(e) {
          console.log("transaction.oncomplete", e);
          // TODO: hier moet je eigenlijk een get(course.id) doen.
          resolve(course);
        };
        var store = transaction.objectStore("course");
        var request = store.put(course);
        //request.onerror = 
        request.onsuccess = function(e) {
          course.id = e.target.result;
          console.log("request.onsuccess", e);
        };
      });
    },
    
    deleteCourse : function(id) {
      return new Promise(function(resolve, reject) {
        var transaction = db.transaction(["course"], "readwrite");
        transaction.oncomplete = function() {
          console.log("complete delete transaction");
        };
        var store = transaction.objectStore("course");
        var request = store.delete(parseInt(id));
        request.onsuccess = function() {
          console.log("success delete");
          resolve();
        };
        request.onerror = function() {
          reject();
        };
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
        request.onerror = function() {
          reject();
        };
      });
    },
    
    saveEntry : function(entry, courseId) {
      if (("id" in entry) && !entry.id) {
        delete entry.id;
      }
      return new Promise(function(resolve, reject) {
        entry.course_id = parseInt(courseId);
        var transaction = db.transaction(["entry"], "readwrite");
        transaction.oncomplete = function(e) {
          console.log("transaction.oncomplete", e);
          // TODO: hier moet je eigenlijk een get(entry.id) doen.
          resolve(entry);
        };
        var store = transaction.objectStore("entry");
        var request = store.put(entry);
        //request.onerror = 
        request.onsuccess = function(e) {
          entry.id = e.target.result;
          console.log("request.onsuccess", e);
        };
      });
    },
    
    deleteEntry : function(entryId, courseId) {
      return new Promise(function(resolve, reject) {
        var transaction = db.transaction(["entry"], "readwrite");
        transaction.oncomplete = function() {
          console.log("complete delete transaction");
        };
        var store = transaction.objectStore("entry");
        var request = store.delete(parseInt(entryId));
        request.onsuccess = function() {
          console.log("success delete");
          resolve();
        };
        request.onerror = function() {
          reject();
        };
      });
    }
    
  };
  

}(window));
