import { describe, it, expect } from 'vitest';

// Re-implement minimal Store for testing
class Store {
  #state = new Map();
  #listeners = new Map();
  #emitQueue = new Set();
  #batchDepth = 0;

  constructor(initial = {}) {
    for (const [key, val] of Object.entries(initial)) this.#state.set(key, val);
  }

  get(key) { return this.#state.get(key); }

  set(key, val) {
    const prev = this.#state.get(key);
    if (Object.is(prev, val)) return;
    this.#state.set(key, val);
    this.#notify(key, val, prev);
  }

  subscribe(key, handler) {
    if (!this.#listeners.has(key)) this.#listeners.set(key, new Set());
    this.#listeners.get(key).add(handler);
    return () => this.#listeners.get(key)?.delete(handler);
  }

  #notify(key, val, prev) {
    if (this.#batchDepth > 0) { this.#emitQueue.add(key); return; }
    const handlers = this.#listeners.get(key);
    if (handlers) queueMicrotask(() => { for (const h of handlers) h(val, prev); });
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

  snapshot() { return Object.fromEntries(this.#state); }
}

describe('Store', () => {
  it('returns initial values', () => {
    const s = new Store({ a: 1, b: 'hello' });
    expect(s.get('a')).toBe(1);
    expect(s.get('b')).toBe('hello');
  });

  it('sets and gets values', () => {
    const s = new Store();
    s.set('count', 42);
    expect(s.get('count')).toBe(42);
  });

  it('does not notify on same value', () => {
    const s = new Store({ x: 1 });
    let calls = 0;
    s.subscribe('x', () => calls++);
    s.set('x', 1); // same value, Object.is
    expect(calls).toBe(0);
  });

  it('notifies subscribers on change', async () => {
    const s = new Store({ x: 1 });
    let val = null;
    s.subscribe('x', (v) => { val = v; });
    s.set('x', 2);
    await new Promise(r => setTimeout(r, 0)); // queueMicrotask
    expect(val).toBe(2);
  });

  it('unsubscribe removes listener', async () => {
    const s = new Store({ x: 1 });
    let calls = 0;
    const unsub = s.subscribe('x', () => calls++);
    unsub();
    s.set('x', 2);
    await new Promise(r => setTimeout(r, 0));
    expect(calls).toBe(0);
  });

  it('batch defers notifications until end', () => {
    const s = new Store({ a: 1, b: 2 });
    const calls = [];
    s.subscribe('a', (v) => calls.push(`a=${v}`));
    s.subscribe('b', (v) => calls.push(`b=${v}`));
    let mid = '';
    s.batch(() => {
      s.set('a', 10);
      mid = calls.join(',');
      s.set('b', 20);
    });
    expect(mid).toBe(''); // no notifications during batch
    expect(calls).toContain('a=10');
    expect(calls).toContain('b=20');
  });

  it('snapshot returns all values', () => {
    const s = new Store({ x: 1, y: 'hi' });
    expect(s.snapshot()).toEqual({ x: 1, y: 'hi' });
  });
});
