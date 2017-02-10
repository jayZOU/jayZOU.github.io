var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
  '/',
  './css/main.css',
  './js/main.js',
  'https://res.wx.qq.com/mmbizwap/zh_CN/htmledition/js/vconsole/2.5.1/vconsole.min.js'
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
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response) {
//         console.log(event);
//         // Cache hit - return response
//         if (response) {
//           return response;
//         }
//         return fetch(event.request);
//       }
//     )
//   );
// });