/* Task 38: IntersectionObserver Pool Manager */
import { store } from '../state/store.js';
class ObserverPool {
  #observers = new Map();
  #entries = new Map();

  create(name, opts = {}) {
    if (this.#observers.has(name)) return this.#observers.get(name);
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const handlers = this.#entries.get(name);
        if (!handlers) return;
        for (const [el, handler] of handlers) {
          if (entry.target === el) {
            handler(entry, obs);
            if (opts.once && entry.isIntersecting) {
              obs.unobserve(el);
              handlers.delete(el);
            }
          }
        }
      });
    }, {
      threshold: opts.threshold ?? 0.08,
      rootMargin: opts.rootMargin ?? '0px',
    });
    this.#observers.set(name, obs);
    this.#entries.set(name, new Map());
    return obs;
  }

  observe(name, el, handler) {
    const obs = this.#observers.get(name);
    if (!obs) throw new Error(`Observer "${name}" not found`);
    const handlers = this.#entries.get(name);
    handlers.set(el, handler);
    obs.observe(el);
    return () => {
      obs.unobserve(el);
      handlers.delete(el);
    };
  }

  disconnect(name) {
    const obs = this.#observers.get(name);
    if (obs) {
      obs.disconnect();
      this.#observers.delete(name);
      this.#entries.delete(name);
    }
  }

  async scrollIntoView(el, offset = 0) {
    return new Promise((resolve) => {
      const lenis = store.get('lenis');
      if (lenis?.isRunning) {
        lenis.scrollTo(el, { offset, duration: 1.2, onComplete: resolve });
      } else {
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        setTimeout(resolve, 800);
      }
    });
  }
}

export const observerPool = new ObserverPool();
