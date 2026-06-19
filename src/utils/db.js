/* Task 24: IndexedDB Wrapper with Caching */
class Database {
  #db = null;
  #ready = false;
  #queue = [];

  constructor(name = 'LifeGexDB', version = 1) {
    this.name = name;
    this.version = version;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.name, this.version);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('translations')) {
          db.createObjectStore('translations', { keyPath: 'locale' });
        }
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('cache')) {
          const cache = db.createObjectStore('cache', { keyPath: 'url' });
          cache.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
      req.onsuccess = (e) => {
        this.#db = e.target.result;
        this.#ready = true;
        for (const q of this.#queue) q();
        this.#queue = [];
        resolve(this);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async get(store, key) {
    await this.#wait();
    return new Promise((resolve, reject) => {
      const tx = this.#db.transaction(store, 'readonly');
      const req = tx.objectStore(store).get(key);
      req.onsuccess = () => resolve(req.result?.value ?? req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async set(store, key, value) {
    await this.#wait();
    return new Promise((resolve, reject) => {
      const tx = this.#db.transaction(store, 'readwrite');
      const req = tx.objectStore(store).put({ key, value, timestamp: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async cache(url, maxAge = 3600000) {
    const cached = await this.get('cache', url);
    if (cached && Date.now() - cached.timestamp < maxAge) return cached.value;
    const res = await fetch(url);
    const data = await res.json();
    await this.set('cache', url, data);
    return data;
  }

  async delete(store, key) {
    await this.#wait();
    return new Promise((resolve, reject) => {
      const tx = this.#db.transaction(store, 'readwrite');
      const req = tx.objectStore(store).delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async clear(store) {
    await this.#wait();
    return new Promise((resolve, reject) => {
      const tx = this.#db.transaction(store, 'readwrite');
      const req = tx.objectStore(store).clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  #wait() {
    if (this.#ready) return Promise.resolve();
    return new Promise(resolve => this.#queue.push(resolve));
  }
}

export const db = new Database();
