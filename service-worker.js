var CACHE_NAME = 'courser-1';

var REQUIRED_FILES = [
  'dist/react.min.js',
  'dist/polyfills.js',
  'dist/react-dom.min.js',
  'dist/dropbox.js',
  'dist/verysimpleredux.js',
  'storage.js',
  'store.js',
  'build/CourseScreen.js',
  'build/CoursesList.js',
  'build/CourseActionScreen.js',
  'build/Dialog.js',
  'build/DoCourseScreen.js',
  'build/EntriesScreen.js',
  'build/ShuffleScreen.js',
  'build/index.js',
  'style.css',
  'index.html',
  'appicon.png'
];

self.addEventListener('install', function(event) {
  
  console.log("EVENT " + event.type);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log("Opened cache and now adding all files to cache");
        return cache.addAll(REQUIRED_FILES);
      })
  );

});

self.addEventListener('fetch', function(event) {

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
  
});

self.addEventListener('activate', function activator (event) {
  
  console.log("EVENT " + event.type);
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log(cacheName);
          //if (cacheWhitelist.indexOf(cacheName) === -1) {
          if (cacheName !== CACHE_NAME) {
            console.log("DELETE CACHE " + cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
});
