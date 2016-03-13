(function(win) {

  win.checkIndexedDB = function() {
    var req = indexedDB.open("langlearn", 1).onsuccess = start;
  };
  
  var json = {}; // objectStoreName => objects
  
  function start(e) {
    var store, i;
    var db = e.target.result;
    var transaction = db.transaction(db.objectStoreNames);
    transaction.oncomplete = finish;
    for (i = 0; i < db.objectStoreNames.length; i++) {
      store = transaction.objectStore(db.objectStoreNames[i]);
      json[store.name] = [];
      store.openCursor().onsuccess = dumpStore;
    }
  }
  
  function finish() {
    console.log(json);
  }
  
  function dumpStore(e) {
    var storeName = this.source.name;
    var cursor = e.target.result;
    if (cursor) {
      console.log(cursor.value);
      json[storeName].push(cursor.value);
      cursor.continue();
    } else {
      console.log("Klaar met " + storeName);
    }
  }

}(window));