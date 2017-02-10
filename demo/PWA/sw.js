var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
  '/',
  './about.html',
  './page.html',
  './css/main.css',
  './js/main.js',
];

// console.log(self);

//安装
self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

//拦截请求
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // console.log(event);
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});