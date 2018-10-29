const cacheName = 'v8:static';

self.addEventListener('install', function (e) {
	// Once the service worker is installed, go ahead and fetch the resources to make this work offline.
	e.waitUntil(
		caches.open(cacheName).then(function (cache) {
			return cache.addAll([
				'./index.html',
				'./assets/greatvibes-regular.ttf',
				'./assets/pacifico-regular.ttf',
				'./assets/BungeeInline-Regular.ttf',
				'./assets/FrederickatheGreat-Regular.ttf',
				'./assets/Handlee-Regular.ttf',
				'./assets/IndieFlower.ttf',
				'./assets/Monoton-Regular.ttf',
				'./assets/Montserrat-Regular.ttf',
				'./assets/Shrikhand-Regular.ttf',
				'./assets/Spirax-Regular.ttf',
				'./assets/Yellowtail-Regular.ttf',
				'./assets/pace.min.js',
				'./assets/pace-theme-osx.css',
			]).then(function () {
				self.skipWaiting();
			});
		})
	);
});

self.addEventListener('fetch', function (event) {
	event.respondWith(
		caches.match(event.request).then(function (response) {
			return response || fetch(event.request);
		})
	);
});

self.addEventListener('activate', function (event) {
	event.waitUntil(
		caches.keys().then(function (cacheNames) {
			return Promise.all(
				cacheNames.filter(function (cacheName) {
					// Return true if you want to remove this cache,
					// but remember that caches are shared across
					// the whole origin
				}).map(function (cacheName) {
					return caches.delete(cacheName);
				})
			);
		})
	);
});