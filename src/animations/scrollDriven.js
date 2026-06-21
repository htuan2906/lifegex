/* Task 16: Scroll-Driven Animations (CSS scroll-timeline polyfill + native) */
class ScrollDrivenAnimations {
  #supports = CSS.supports('animation-timeline: scroll()');
  #elements = [];
  #observer = null;

  init(root = document) {
    this.#elements = root.querySelectorAll('[data-scroll-drive]');
    if (this.#supports) {
      this.#native();
    } else {
      this.#jsFallback();
    }
  }

  #native() {
    let sheet = document.styleSheets[0];
    if (!sheet) {
      const style = document.createElement('style');
      document.head.appendChild(style);
      this._sheet = style;
      sheet = style.sheet || document.styleSheets[document.styleSheets.length - 1];
    }
    this.#elements.forEach(el => {
      const prop = el.dataset.scrollDrive || 'progress';
      sheet.insertRule(`
        @keyframes ${prop}-${el.dataset.uid || Math.random().toString(36).slice(2)} {
          from { ${prop}: 0; }
          to { ${prop}: 1; }
        }
      `, 0);
    });
  }

  #jsFallback() {
    const callback = (entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        const progress = entry.intersectionRatio;
        const prop = el.dataset.scrollDrive || 'transform';
        if (prop === 'transform') {
          el.style.transform = `scaleX(${progress})`;
        } else if (prop === 'opacity') {
          el.style.opacity = progress;
        } else if (prop === '--scroll-y') {
          el.style.setProperty('--scroll-y', progress);
        }
      });
    };

    const obs = new IntersectionObserver(callback, { threshold: Array.from({ length: 20 }, (_, i) => i / 20) });
    this.#observer = obs;
    this.#elements.forEach(el => obs.observe(el));
  }

  destroy() {
    this.#elements.forEach(el => el.style.transform = '');
    this.#elements = [];
    if (this.#observer) this.#observer.disconnect();
    if (this._sheet) document.head.removeChild(this._sheet);
  }
}

export const scrollDriven = new ScrollDrivenAnimations();
