var CACHE_NAME = 'dependencies-cache-1';

var REQUIRED_FILES = [
  'dist/react.js',
  'dist/react-dom.js',
  'dist/verysimpleredux.js',
  'storage-indexeddb.js',
  'store.js',
  'build/CourseScreen.js',
  'build/CoursesList.js',
  'build/Dialog.js',
  'build/DoCourseScreen.js',
  'build/EntriesScreen.js',
  'build/index.js',
  'style.css',
  'index.html'
];

// http://www.html5rocks.com/en/tutorials/service-worker/introduction/

self.addEventListener('install', function(event) {
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[install] Caches opened, adding all core components' +
          'to cache');
        return cache.addAll(REQUIRED_FILES);
      })
      .then(function() {
        console.log('[install] All required resources have been cached, ' +
          'we\'re good!');
        return self.skipWaiting();
      })
    );
  });

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {        
        if (response) {
          console.log(
            '[fetch] Returning from ServiceWorker cache: ',
            event.request.url
          );
          return response;
        }
        
        var fetchRequest = event.request.clone();
        
        console.log('[fetch] Returning from server: ', fetchRequest.url);
        return fetch(fetchRequest);
      }
    )
  );
});

// https://ponyfoo.com/articles/serviceworker-revolution => delete old cache
self.addEventListener('activate', function activator (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys
        .filter(function (key) {
          return key.indexOf(CACHE_NAME) !== 0;
        })
        .map(function (key) {
          console.log("delete " + key);
          return caches.delete(key);
        })
      );
    })
  );
});

//self.addEventListener('activate', function(event) {
//  console.log('[activate] Activating ServiceWorker!');
//  
//  console.log('[activate] Claiming this ServiceWorker!');
//  event.waitUntil(self.clients.claim());
//});