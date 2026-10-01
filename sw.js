/**
 * GoDoz Technology - Official Service Worker (PWA Offline Engine)
 * Founder & Lead Engineer: RS GULSHAN PRAJAPATI
 * Domain: https://www.godoz.in
 */

const CACHE_NAME = 'godoz-cache-v2.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './About.html',
  './login.html',
  './profile.html',
  './help/index.html',
  './feedback.html',
  './terms.html',
  './privacy-policy.html',
  './style.css',
  './script.js',
  './firebase-init.js',
  './official logo.png',
  './manifest.json'
];

// Install Event: Cache Core Static Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[GoDoz SW] Pre-caching static assets (v2.0)');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[GoDoz SW] Pre-cache partial error:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean Old Caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[GoDoz SW] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Network First for fresh live updates with instant offline cache fallback
self.addEventListener('fetch', (event) => {
  // Only intercept standard GET requests (Prevents POST / PUT Cache Storage API errors)
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);

  // Skip Firebase / Firestore / External APIs from Service Worker cache
  if (
    requestUrl.origin.includes('firestore.googleapis.com') ||
    requestUrl.origin.includes('identitytoolkit.googleapis.com') ||
    requestUrl.origin.includes('razorpay.com') ||
    requestUrl.origin.includes('qrserver.com') ||
    requestUrl.origin.includes('pagead2.googlesyndication.com')
  ) {
    return;
  }

  // Network First Strategy for all local site assets
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html');
          }
        });
      })
  );
});
