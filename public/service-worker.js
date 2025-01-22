const CACHE_NAME = 'terasid-portfolio-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/icons/icon-192x192.png'
];

// Dynamic cache for API responses
const API_CACHE = 'api-cache-v1';

// Background sync queue
const BACKGROUND_SYNC_QUEUE = 'background-sync-queue';

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME && name !== API_CACHE)
            .map(name => caches.delete(name))
        );
      }),
      // Enable navigation preload if available
      'navigationPreload' in self.registration 
        ? self.registration.navigationPreload.enable()
        : Promise.resolve()
    ])
  );
});

// Background Sync
self.addEventListener('sync', event => {
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(
      syncContactForm()
    );
  }
});

// Push Notification
self.addEventListener('push', event => {
  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'explore', title: 'View Portfolio' },
      { action: 'close', title: 'Close' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('TERASID Portfolio', options)
  );
});

// Notification Click
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/portfolio')
    );
  }
});

// Fetch event with network-first strategy for API calls and cache-first for static assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // API calls - Network first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clonedResponse = response.clone();
          caches.open(API_CACHE).then(cache => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Static assets - Cache first
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Helper function for background sync
async function syncContactForm() {
  try {
    const entries = await getEntriesFromQueue();
    for (const entry of entries) {
      await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      });
    }
    await clearQueue();
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// IndexedDB helpers for queue management
function getEntriesFromQueue() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('contact-form-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(BACKGROUND_SYNC_QUEUE, 'readonly');
      const store = transaction.objectStore(BACKGROUND_SYNC_QUEUE);
      const entries = [];
      
      store.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          entries.push(cursor.value);
          cursor.continue();
        } else {
          resolve(entries);
        }
      };
    };
  });
}

function clearQueue() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('contact-form-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(BACKGROUND_SYNC_QUEUE, 'readwrite');
      const store = transaction.objectStore(BACKGROUND_SYNC_QUEUE);
      store.clear();
      resolve();
    };
  });
}
