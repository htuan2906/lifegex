/* Task 43: Sticky Section Navigation Indicator */
import { BaseComponent } from './BaseComponent.js';

export class StickyNavIndicator extends BaseComponent {
  mount() {
    this.progressBar = this.$('.nav-progress-bar');
    this.sections = [];
    document.querySelectorAll('section[id]').forEach(s => {
      this.sections.push({ id: s.id, el: s, label: s.querySelector('.section-label')?.textContent?.trim() || s.id });
    });
    this.#bindScroll();
  }

  #bindScroll() {
    let ticking = false;
    this.on(window, 'scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.#update();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  #update() {
    const scrollY = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docH > 0 ? scrollY / docH : 0;
    if (this.progressBar) {
      this.progressBar.style.transform = `scaleX(${progress})`;
    }
    let active = '';
    this.sections.forEach(s => {
      const top = s.el.offsetTop - 150;
      if (scrollY >= top) active = s.id;
    });
  }
}

BaseComponent.define('sticky-nav-indicator', StickyNavIndicator);
