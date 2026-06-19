/* Task 25: URL State Sync */
class URLSynchronizer {
  #params = new Map();
  #dirty = false;

  constructor() {
    this.#syncFromURL();
    window.addEventListener('popstate', () => this.#syncFromURL());
  }

  #syncFromURL() {
    const sp = new URLSearchParams(location.search);
    this.#params.clear();
    for (const [k, v] of sp) this.#params.set(k, v);
    this.#emit();
  }

  #emit() {
    window.dispatchEvent(new CustomEvent('urlsync', {
      detail: Object.fromEntries(this.#params),
    }));
  }

  set(key, val, push = false) {
    this.#params.set(key, String(val));
    this.#apply(push);
  }

  get(key) {
    return this.#params.get(key) || null;
  }

  delete(key, push = false) {
    this.#params.delete(key);
    this.#apply(push);
  }

  #apply(push) {
    const sp = new URLSearchParams();
    for (const [k, v] of this.#params) sp.set(k, v);
    const qs = sp.toString();
    const url = qs ? `${location.pathname}?${qs}` : location.pathname;
    if (push) {
      history.pushState({ lgx: true }, '', url);
    } else {
      history.replaceState({ lgx: true }, '', url);
    }
    this.#emit();
  }

  onChange(handler) {
    window.addEventListener('urlsync', (e) => handler(e.detail));
  }

  toObject() {
    return Object.fromEntries(this.#params);
  }
}

export const urlSync = new URLSynchronizer();
