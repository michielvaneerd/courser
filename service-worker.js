var CACHE_NAME = 'courser-20160511152600';

// See for immediate claim:
// together with index.js window.location.reload() inside
// the controllerchange event, you can immediatety make the new service worker
// take advantage.
// https://serviceworke.rs/immediate-claim_service-worker_doc.html

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
  'appicon.png',
  'favicon.ico'
];

self.addEventListener('install', function(event) {
  
  console.log("EVENT " + event.type);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log("Opened cache and now adding all files to cache");
        return cache.addAll(REQUIRED_FILES);
      }).then(function() {
        return self.skipWaiting();
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
  
  // Event.waitUntill will block all other events, until the promise
  // it receives resolves or is rejected.
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
    }).then(function() {
      return self.clients.claim();
    })
  );
  
});
