import { describe, it, expect, vi, afterEach } from 'vitest';

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
    if (!s || !s.on || !s.on[event]) return false;
    const target = s.on[event];
    const prev = this.#current;
    this.#history.push(prev);
    this.#current = target;
    this.#emit(prev, target, event, payload);
    if (this.#states[target]?.enter) this.#states[target].enter(payload);
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

  is(...states) { return states.includes(this.#current); }

  delayTransition(event, ms) {
    if (this.#timer) clearTimeout(this.#timer);
    this.#timer = setTimeout(() => { this.#timer = null; this.transition(event); }, ms);
  }
}

describe('StateMachine', () => {
  let sm;

  const config = {
    initial: 'booting',
    states: {
      booting: { on: { LOADED: 'idle', ERROR: 'error' } },
      idle: { on: { NAVIGATE: 'transitioning', OPEN_MENU: 'menu' } },
      transitioning: {
        on: { DONE: 'idle', ERROR: 'error' },
        enter: vi.fn(),
      },
      menu: { on: { CLOSE: 'idle' } },
      error: { on: { RETRY: 'booting' } },
    },
  };

  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });

  it('starts in initial state', () => {
    sm = new StateMachine(config);
    expect(sm.current).toBe('booting');
  });

  it('transitions to target state', () => {
    sm = new StateMachine(config);
    sm.transition('LOADED');
    expect(sm.current).toBe('idle');
  });

  it('returns false for invalid transition', () => {
    sm = new StateMachine(config);
    expect(sm.transition('NAVIGATE')).toBe(false);
  });

  it('can() returns correct permissions', () => {
    sm = new StateMachine(config);
    expect(sm.can('LOADED')).toBe(true);
    expect(sm.can('NAVIGATE')).toBe(false);
  });

  it('calls enter function on transition', () => {
    sm = new StateMachine(config);
    sm.transition('LOADED');
    sm.transition('NAVIGATE');
    expect(config.states.transitioning.enter).toHaveBeenCalled();
  });

  it('back() returns to previous state', () => {
    sm = new StateMachine(config);
    sm.transition('LOADED');
    sm.transition('NAVIGATE');
    sm.back();
    expect(sm.current).toBe('idle');
    sm.back();
    expect(sm.current).toBe('booting');
  });

  it('back() returns false if no history', () => {
    sm = new StateMachine(config);
    expect(sm.back()).toBe(false);
  });

  it('is() checks current state', () => {
    sm = new StateMachine(config);
    expect(sm.is('booting')).toBe(true);
    expect(sm.is('idle', 'error')).toBe(false);
  });

  it('delayTransition fires after timeout', async () => {
    vi.useFakeTimers();
    sm = new StateMachine(config);
    sm.transition('LOADED');
    sm.transition('NAVIGATE');
    sm.delayTransition('DONE', 100);
    expect(sm.current).toBe('transitioning');
    vi.advanceTimersByTime(100);
    expect(sm.current).toBe('idle');
  });

  it('notifies listeners on transition', async () => {
    sm = new StateMachine(config);
    const handler = vi.fn();
    sm.on('LOADED', handler);
    sm.transition('LOADED');
    await new Promise(r => setTimeout(r, 0));
    expect(handler).toHaveBeenCalledWith({
      from: 'booting', to: 'idle', payload: undefined,
    });
  });
});
