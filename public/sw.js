// Service Worker for caching and offline support

const CACHE_NAME = 'craftly-ai-v1';
const STATIC_CACHE_NAME = 'craftly-static-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo-contex.png',
  '/manifest.json'
];

const CACHE_STRATEGIES = {
  // Cache first for static assets
  cacheFirst: [
    /\.(?:js|css|woff|woff2|ttf|eot)$/,
    /\/static\//,
    /\/assets\//
  ],
  
  // Network first for API calls
  networkFirst: [
    /\/api\//,
    /googleapis\.com/,
    /firebaseio\.com/
  ],
  
  // Stale while revalidate for pages
  staleWhileRevalidate: [
    /\/$/,
    /\.html$/
  ]
};

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Determine cache strategy
  let strategy = 'networkFirst'; // default
  
  for (const [strategyName, patterns] of Object.entries(CACHE_STRATEGIES)) {
    if (patterns.some(pattern => pattern.test(url.pathname) || pattern.test(url.href))) {
      strategy = strategyName;
      break;
    }
  }
  
  event.respondWith(handleRequest(request, strategy));
});

// Handle different caching strategies
async function handleRequest(request, strategy) {
  const cacheName = CACHE_NAME;
  
  switch (strategy) {
    case 'cacheFirst':
      return cacheFirst(request, cacheName);
    
    case 'networkFirst':
      return networkFirst(request, cacheName);
    
    case 'staleWhileRevalidate':
      return staleWhileRevalidate(request, cacheName);
    
    default:
      return fetch(request);
  }
}

// Cache first strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network request failed:', error);
    
    // Return offline fallback if available
    if (request.destination === 'document') {
      return cache.match('/offline.html') || cache.match('/');
    }
    
    throw error;
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network request failed, trying cache:', error);
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in the background
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch((error) => {
    console.log('Service Worker: Background fetch failed:', error);
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for network
  return fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline actions when connection is restored
  // This could include syncing saved resumes, cover letters, etc.
  console.log('Service Worker: Performing background sync');
}

// Push notifications (if needed in future)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/logo-contex.png',
    badge: '/logo-contex.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/logo-contex.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/logo-contex.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Craftly AI', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});