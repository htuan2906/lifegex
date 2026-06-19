/* Task 20: Morphing Logo SVG Animation */
class MorphLogo {
  #paths = {
    idle: 'M3 12h4l3-8 4 16 3-8h4',
    hover: 'M3 12h6l3-8 2 16 5-8h2',
    scroll: 'M4 12h3l4-8 3 16 4-8h3',
    dark: 'M3 12h5l3-8 3 16 5-8h2',
    morph: null,
  };
  #current = 'idle';
  #pathEl = null;
  #frameId = null;

  init(el) {
    this.#pathEl = el?.querySelector('path') || document.querySelector('.logo path');
    if (!this.#pathEl) return;
    this.#bindEvents();
  }

  #bindEvents() {
    const logo = this.#pathEl.closest('.logo');
    if (!logo) return;

    logo.addEventListener('mouseenter', () => this.#transition('hover'));
    logo.addEventListener('mouseleave', () => this.#transition('idle'));

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          this.#pathEl.setAttribute('d', scrollY > 200 ? this.#paths.scroll : this.#paths.idle);
          ticking = false;
        });
        ticking = true;
      }
    });

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      const obs = new MutationObserver(() => {
        if (document.body.classList.contains('dark')) {
          this.#pathEl.setAttribute('d', this.#paths.dark);
        }
      });
      obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
  }

  #transition(target) {
    if (this.#current === target) return;
    this.#current = target;
    this.#animatePath(this.#paths[target]);
  }

  #animatePath(targetD) {
    if (this.#frameId) cancelAnimationFrame(this.#frameId);
    const startD = this.#pathEl.getAttribute('d');
    let t = 0;
    const dur = 300;
    const start = performance.now();

    const step = (now) => {
      t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      this.#pathEl.setAttribute('d', t < 1 ? startD : targetD);
      if (t < 1) this.#frameId = requestAnimationFrame(step);
    };
    this.#frameId = requestAnimationFrame(step);
  }
}

export const morphLogo = new MorphLogo();
