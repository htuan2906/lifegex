/* Task 28: Navigation History Stack */
class HistoryStack {
  #stack = [];
  #index = -1;
  #maxSize = 50;
  #listeners = new Map();

  constructor() {
    window.addEventListener('popstate', (e) => {
      if (e.state?.lgx) this.#restore(e.state.lgx);
    });
  }

  push(state) {
    this.#stack = this.#stack.slice(0, this.#index + 1);
    this.#stack.push(state);
    if (this.#stack.length > this.#maxSize) this.#stack.shift();
    this.#index = this.#stack.length - 1;
    history.pushState({ lgx: this.#index }, '', state.url || '');
    this.#emit('push', state);
  }

  back() {
    if (this.#index <= 0) return false;
    this.#index--;
    this.#restore(this.#index);
    history.back();
    return true;
  }

  forward() {
    if (this.#index >= this.#stack.length - 1) return false;
    this.#index++;
    this.#restore(this.#index);
    history.forward();
    return true;
  }

  canBack() { return this.#index > 0; }
  canForward() { return this.#index < this.#stack.length - 1; }

  #restore(idx) {
    const state = this.#stack[idx];
    if (!state) return;
    this.#index = idx;
    this.#emit('restore', state);
  }

  on(event, handler) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, new Set());
    this.#listeners.get(event).add(handler);
    return () => this.#listeners.get(event)?.delete(handler);
  }

  #emit(event, data) {
    const handlers = this.#listeners.get(event);
    if (handlers) queueMicrotask(() => {
      for (const h of handlers) h(data);
    });
  }

  clear() { this.#stack = []; this.#index = -1; }
}

export const historyStack = new HistoryStack();
