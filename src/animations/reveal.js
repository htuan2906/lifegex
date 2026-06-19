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
      const delay = el.dataset.delay
        ? parseInt(el.dataset.delay) * 100
        : i * stagger;
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
    el.style.transform = transforms[origin] || transforms.bottom;
    el.style.opacity = '0';
    el.style.transition = `all 0.7s cubic-bezier(0.16, 1, 0.3, 1)`;
  }

  refresh() {
    document.querySelectorAll('.reveal.show').forEach(el => {
      el.classList.remove('show');
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
    });
    this.#initObserver();
    document.querySelectorAll('.reveal').forEach(el => {
      observerPool.observe('reveal', el, (entry) => {
        if (entry.isIntersecting) el.classList.add('show');
      });
    });
  }
}

export const revealEngine = new RevealEngine();
