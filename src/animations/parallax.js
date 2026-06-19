/* Task 19: Depth Parallax Layers */
import { config } from '../utils/config.js';

class ParallaxEngine {
  #layers = [];
  #enabled = config.features.parallax;

  init(root = document) {
    if (!this.#enabled) return;
    this.#layers = root.querySelectorAll('[data-parallax]');
    if (this.#layers.length === 0) return;
    this.#bind();
  }

  #bind() {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const sy = window.scrollY;
          this.#layers.forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.3;
            const y = sy * speed;
            el.style.transform = `translateY(${y}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  addLayer(el, speed = 0.3) {
    if (!this.#enabled) return;
    el.dataset.parallax = speed;
    this.#layers.push(el);
  }

  destroy() {
    this.#layers.forEach(el => el.style.transform = '');
    this.#layers = [];
  }
}

export const parallaxEngine = new ParallaxEngine();
