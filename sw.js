const CACHE_NAME = 'artisan-co-v3';

const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/images/manya.jpeg',
    // Hero + about (above-the-fold critical)
    '/images/WhatsApp Image 2026-04-05 at 11.50.24.jpeg',
    '/images/WhatsApp Image 2026-04-05 at 11.50.24 (1).jpeg',
    '/images/WhatsApp Image 2026-04-05 at 11.50.25.jpeg',
    // Gallery (horizontal scroll — must be decoded before animation)
    '/images/WhatsApp Image 2026-04-05 at 11.50.25 (1).jpeg',
    '/images/WhatsApp Image 2026-04-05 at 11.50.25 (2).jpeg',
    '/images/WhatsApp Image 2026-04-05 at 11.50.25 (3).jpeg',
    '/images/WhatsApp Image 2026-04-05 at 11.50.26.jpeg',
    '/images/WhatsApp Image 2026-04-05 at 11.50.26 (1).jpeg',
    '/images/WhatsApp Image 2026-04-05 at 11.50.26 (2).jpeg',
    '/images/WhatsApp Image 2026-04-05 at 11.50.27.jpeg',
    '/images/WhatsApp Image 2026-04-05 at 11.50.27 (1).jpeg',
    '/images/WhatsApp Image 2026-04-05 at 11.50.28.jpeg',
    '/images/WhatsApp Image 2026-04-05 at 11.50.28 (1).jpeg',
    '/images/WhatsApp Image 2026-04-05 at 11.50.28 (2).jpeg',
    // Reel
    '/images/VID_20260404_232543_339.mp4',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) =>
            // Tolerate individual failures so one missing asset doesn't abort the whole precache
            Promise.all(
                PRECACHE_URLS.map((url) =>
                    cache.add(url).catch(() => {})
                )
            )
        )
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    // Cache-first for same-origin static assets; stale-while-revalidate for others
    const url = new URL(event.request.url);
    const sameOrigin = url.origin === self.location.origin;

    event.respondWith(
        caches.match(event.request).then((cached) => {
            const fetched = fetch(event.request).then((response) => {
                if (response && response.status === 200 && sameOrigin) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => cached);
            // For cached assets, return cache immediately; revalidate in background
            return cached || fetched;
        })
    );
});
