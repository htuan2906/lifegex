/* Task 27: Scroll Reveal Engine (enhanced stagger) */
import { observerPool } from '../utils/observer.js';

class RevealEngine {
  #defaults = {
    threshold: 0.08,
    stagger: 80,
    origin: 'bottom',
  };

  constructor() {
    this.#initObserver();
  }

  #initObserver() {
    observerPool.create('reveal', {
      threshold: this.#defaults.threshold,
      once: true,
    });
  }

  observe(root, opts = {}) {
    const { stagger, origin } = { ...this.#defaults, ...opts };
    const items = root.querySelectorAll('.reveal');
    if (items.length === 0) return;

    items.forEach((el, i) => {
      if (el.classList.contains('reveal-ready')) return;
      const delay = el.dataset.delay
        ? parseInt(el.dataset.delay) * 100
        : Math.min(i * stagger, 320);
      el.style.transitionDelay = `${delay}ms`;
      this.#setOrigin(el, origin);
      observerPool.observe('reveal', el, (entry) => {
        if (entry.isIntersecting) {
          el.classList.add('show');
        }
      });
    });
  }

  #setOrigin(el, origin) {
    const transforms = {
      bottom: 'translateY(30px)',
      top: 'translateY(-30px)',
      left: 'translateX(-30px)',
      right: 'translateX(30px)',
      scale: 'scale(0.95)',
    };
    el.style.setProperty('--reveal-from', transforms[origin] || transforms.bottom);
    el.classList.add('reveal-ready');
  }

  refresh() {
    const root = document;
    root.querySelectorAll('.reveal.show').forEach(el => {
      el.classList.remove('show');
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
    });
    observerPool.create('reveal-refresh', {
      threshold: this.#defaults.threshold,
      once: false,
    });
    root.querySelectorAll('.reveal').forEach(el => {
      observerPool.observe('reveal-refresh', el, (entry) => {
        if (entry.isIntersecting) el.classList.add('show');
      });
    });
  }
}

export const revealEngine = new RevealEngine();
