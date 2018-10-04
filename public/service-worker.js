const cacheName = 'v2:static';

self.addEventListener('install', function (e) {
	// Once the service worker is installed, go ahead and fetch the resources to make this work offline.
	e.waitUntil(
		caches.open(cacheName).then(function (cache) {
			return cache.addAll([
				'./build/index.html',
				'./build/assets/greatvibes-regular.ttf',
				'./build/assets/pacifico-regular.ttf',
				'./build/assets/BungeeInline-Regular.ttf',
				'./build/assets/FrederickatheGreat-Regular.ttf',
				'./build/assets/Handlee-Regular.ttf',
				'./build/assets/IndieFlower.ttf',
				'./build/assets/Monoton-Regular.ttf',
				'./build/assets/Montserrat-Regular.ttf',
				'./build/assets/Shrikhand-Regular.ttf',
				'./build/assets/Spirax-Regular.ttf',
				'./build/assets/Yellowtail-Regular.ttf',
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