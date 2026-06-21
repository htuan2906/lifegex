/* Task 24: Reactive State Store */
class Store {
  #state = new Map();
  #listeners = new Map();
  #emitQueue = new Set();
  #batchDepth = 0;

  constructor(initial = {}) {
    for (const [key, val] of Object.entries(initial)) {
      this.#state.set(key, val);
    }
  }

  get(key) {
    return this.#state.get(key);
  }

  set(key, val) {
    const prev = this.#state.get(key);
    if (Object.is(prev, val)) return;
    this.#state.set(key, val);
    this.#notify(key, val, prev);
  }

  update(key, fn) {
    this.set(key, fn(this.#state.get(key)));
  }

  subscribe(key, handler) {
    if (!this.#listeners.has(key)) this.#listeners.set(key, new Set());
    this.#listeners.get(key).add(handler);
    return () => this.#listeners.get(key)?.delete(handler);
  }

  #notify(key, val, prev) {
    if (this.#batchDepth > 0) { this.#emitQueue.add(key); return; }
    const handlers = this.#listeners.get(key);
    if (handlers) queueMicrotask(() => {
      for (const h of handlers) h(val, prev);
    });
  }

  batch(fn) {
    this.#batchDepth++;
    try { fn(); } finally {
      this.#batchDepth--;
      if (this.#batchDepth === 0) {
        for (const k of this.#emitQueue) {
          const val = this.#state.get(k);
          const handlers = this.#listeners.get(k);
          if (handlers) for (const h of handlers) h(val);
        }
        this.#emitQueue.clear();
      }
    }
  }

  snapshot() {
    return Object.fromEntries(this.#state);
  }
}

export const store = new Store({
  theme: 'light',
  lang: 'en',
  scrollY: 0,
  activeSection: '',
  menuOpen: false,
  commandOpen: false,
  loading: true,
  loaded: false,
  currentVenture: null,
  carouselIndex: 0,
  darkPreferred: matchMedia('(prefers-color-scheme: dark)').matches,
  reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  lenis: null,
});
