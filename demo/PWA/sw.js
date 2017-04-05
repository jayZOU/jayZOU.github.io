var CACHE_NAME = 'cachev1';
var urlsToCache = [
    '/',
    '/about.html',
    '/page.html',
    '/css/main.css',
    '/js/main.js',
];

//安装
self.addEventListener('install', function(event) {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(function(cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

//拦截请求
self.addEventListener('fetch', function(event) {
    // console.log(event);
    event.respondWith(
        caches.match(event.request)
        .then(function(response) {
            //在缓存中找到相应文件，直接返回
            if (response) return response;
            //不存在相应缓存文件，可以选择增量缓存之前没有被缓存的资源，之后请求就能直接从缓存中获取
            return fetch(event.request).then(function(response) {
                caches.open(CACHE_NAME)
                    .then(function(cache) {
                        return cache.add(event.request);
                    })
                return response;
            }).catch(function(error) {
                throw error;
            });
        })
    );
});


self.addEventListener('push', function(event) {
    if (!(self.Notification && self.notification.permission === 'granted')) {
        return;
    }

    var data = {};
    if (event.data) {
        data = event.data.json();
    }
    var title = data.title || "Something Has Happened";
    var message = data.message || "Here's something you might want to check out.";
    var icon = "images/new-notification.png";

    var notification = new Notification(title, {
        body: message,
        tag: 'simple-push-demo-notification',
        icon: icon
    });

    notification.addEventListener('click', function() {
        if (clients.openWindow) {
            clients.openWindow('https://example.blog.com/2015/03/04/something-new.html');
        }
    });
});