class OfflineManager {
  constructor() {
    this.db = null;
    this.dbName = 'portfolio-offline-db';
    this.dbVersion = 1;
    this.stores = {
      portfolio: 'portfolio-items',
      forms: 'contact-forms',
      content: 'cached-content'
    };
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Portfolio items store
        if (!db.objectStoreNames.contains(this.stores.portfolio)) {
          db.createObjectStore(this.stores.portfolio, { keyPath: 'id' });
        }

        // Contact forms store
        if (!db.objectStoreNames.contains(this.stores.forms)) {
          db.createObjectStore(this.stores.forms, { keyPath: 'timestamp' });
        }

        // Cached content store
        if (!db.objectStoreNames.contains(this.stores.content)) {
          db.createObjectStore(this.stores.content, { keyPath: 'url' });
        }
      };
    });
  }

  async savePortfolioItem(item) {
    return this.saveToStore(this.stores.portfolio, item);
  }

  async getPortfolioItems() {
    return this.getAllFromStore(this.stores.portfolio);
  }

  async saveContactForm(formData) {
    const form = {
      ...formData,
      timestamp: Date.now(),
      synced: false
    };
    return this.saveToStore(this.stores.forms, form);
  }

  async getPendingForms() {
    const forms = await this.getAllFromStore(this.stores.forms);
    return forms.filter(form => !form.synced);
  }

  async markFormAsSynced(timestamp) {
    const store = this.getStore(this.stores.forms, 'readwrite');
    const form = await this.getFromStore(this.stores.forms, timestamp);
    if (form) {
      form.synced = true;
      return new Promise((resolve, reject) => {
        const request = store.put(form);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    }
  }

  async cacheContent(url, content) {
    return this.saveToStore(this.stores.content, { url, content, timestamp: Date.now() });
  }

  async getCachedContent(url) {
    return this.getFromStore(this.stores.content, url);
  }

  // Helper methods
  getStore(storeName, mode = 'readonly') {
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  saveToStore(storeName, item) {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.put(item);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  getFromStore(storeName, key) {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName);
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  getAllFromStore(storeName) {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName);
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async clearOldCache(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days
    const store = this.getStore(this.stores.content, 'readwrite');
    const items = await this.getAllFromStore(this.stores.content);
    const now = Date.now();

    items.forEach(item => {
      if (now - item.timestamp > maxAge) {
        store.delete(item.url);
      }
    });
  }

  // Network status management
  initNetworkStatusHandler() {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  async handleOnline() {
    console.log('Back online, syncing pending forms...');
    const pendingForms = await this.getPendingForms();
    
    for (const form of pendingForms) {
      try {
        await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(form)
        });
        await this.markFormAsSynced(form.timestamp);
      } catch (error) {
        console.error('Failed to sync form:', error);
      }
    }
  }

  handleOffline() {
    console.log('Gone offline, will sync when connection returns');
    // Show offline notification to user
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Offline Mode', {
        body: 'You are now working offline. Changes will be synced when you reconnect.',
        icon: '/icons/offline.png'
      });
    }
  }
}

// Initialize offline manager
const offlineManager = new OfflineManager();
offlineManager.init().then(() => {
  console.log('Offline manager initialized');
  offlineManager.initNetworkStatusHandler();
}).catch(error => {
  console.error('Failed to initialize offline manager:', error);
});
