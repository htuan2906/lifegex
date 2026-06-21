/* Task 23: Finite State Machine */
class StateMachine {
  #current;
  #states;
  #history = [];
  #listeners = new Map();
  #timer = null;

  constructor(config) {
    this.#states = config.states;
    this.#current = config.initial;
  }

  get current() { return this.#current; }

  can(event) {
    const s = this.#states[this.#current];
    return s && s.on && event in s.on;
  }

  transition(event, payload) {
    const s = this.#states[this.#current];
    if (!s || !s.on || !s.on[event]) {
      console.warn(`[SM] ${this.#current} cannot handle ${event}`);
      return false;
    }
    const target = s.on[event];
    const prev = this.#current;
    this.#history.push(prev);
    this.#current = target;
    this.#emit(prev, target, event, payload);
    if (this.#states[target]?.enter) {
      this.#states[target].enter(payload);
    }
    return true;
  }

  back() {
    if (this.#history.length === 0) return false;
    const prev = this.#history.pop();
    const cur = this.#current;
    this.#current = prev;
    this.#emit(cur, prev, 'back', null);
    return true;
  }

  on(event, handler) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, new Set());
    this.#listeners.get(event).add(handler);
    return () => this.#listeners.get(event)?.delete(handler);
  }

  #emit(from, to, event, payload) {
    queueMicrotask(() => {
      const handlers = this.#listeners.get(event);
      if (handlers) for (const h of handlers) h({ from, to, payload });
    });
  }

  is(...states) {
    return states.includes(this.#current);
  }

  delayTransition(event, ms) {
    if (this.#timer) clearTimeout(this.#timer);
    this.#timer = setTimeout(() => { this.#timer = null; this.transition(event); }, ms);
  }
}

export const appMachine = new StateMachine({
  initial: 'booting',
  states: {
    booting: {
      on: { LOADED: 'idle', ERROR: 'error' },
      enter: () => { /* init services */ },
    },
    idle: {
      on: { NAVIGATE: 'transitioning', OPEN_MENU: 'menu', OPEN_COMMAND: 'command' },
    },
    transitioning: {
      on: { DONE: 'idle', ERROR: 'error' },
      enter: () => {
        appMachine.delayTransition('DONE', 1000);
      },
    },
    menu: {
      on: { CLOSE: 'idle', NAVIGATE: 'idle' },
    },
    command: {
      on: { CLOSE: 'idle', NAVIGATE: 'idle' },
    },
    error: {
      on: { RETRY: 'booting' },
    },
  },
});
