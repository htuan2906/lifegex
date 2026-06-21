/* Component: Metrics Counter with easeOutExpo */
import { BaseComponent } from './BaseComponent.js';

export class MetricsCounter extends BaseComponent {
  #obs = null;

  mount() {
    this.#obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const el = en.target;
          const target = parseInt(el.dataset.target);
          if (!target || el.dataset.counted) return;
          el.dataset.counted = '1';

          const start = performance.now();
          const duration = 1500;

          const step = (now) => {
            const p = Math.min((now - start) / duration, 1);
            // easeOutExpo
            const ep = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
            el.textContent = Math.round(ep * target);
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      });
    }, { threshold: 0.5 });

    this.$$('.count-to').forEach(el => this.#obs.observe(el));
  }

  destroy() {
    if (this.#obs) this.#obs.disconnect();
  }
}

BaseComponent.define('metrics-counter', MetricsCounter);
