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
  #observer = null;
  #cleanupFns = [];

  init(el) {
    this.#pathEl = el?.querySelector('path') || document.querySelector('.logo path');
    if (!this.#pathEl) return;
    this.#cleanupFns = [];
    this.#bindEvents();
  }

  #bindEvents() {
    const logo = this.#pathEl.closest('.logo');
    if (!logo) return;

    const onEnter = () => this.#transition('hover');
    const onLeave = () => this.#transition('idle');
    logo.addEventListener('mouseenter', onEnter);
    logo.addEventListener('mouseleave', onLeave);
    this.#cleanupFns.push(() => { logo.removeEventListener('mouseenter', onEnter); logo.removeEventListener('mouseleave', onLeave); });

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          this.#pathEl.setAttribute('d', scrollY > 200 ? this.#paths.scroll : this.#paths.idle);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll);
    this.#cleanupFns.push(() => window.removeEventListener('scroll', onScroll));

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      this.#observer = new MutationObserver(() => {
        if (document.body.classList.contains('dark')) {
          this.#pathEl.setAttribute('d', this.#paths.dark);
        }
      });
      this.#observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
  }

  #transition(target) {
    if (this.#current === target) return;
    this.#current = target;
    this.#animatePath(this.#paths[target]);
  }

  destroy() {
    if (this.#observer) this.#observer.disconnect();
    if (this.#frameId) cancelAnimationFrame(this.#frameId);
    if (this.#cleanupFns) this.#cleanupFns.forEach(fn => fn());
  }

  #animatePath(targetD) {
    if (this.#frameId) cancelAnimationFrame(this.#frameId);
    const startD = this.#pathEl.getAttribute('d');
    const startPoints = this.#parsePath(startD);
    const targetPoints = this.#parsePath(targetD);
    if (!startPoints || !targetPoints || startPoints.length !== targetPoints.length) {
      this.#pathEl.setAttribute('d', targetD);
      return;
    }
    let t = 0;
    const dur = 300;
    const start = performance.now();
    const step = (now) => {
      t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const current = startPoints.map((sp, i) => {
        const tp = targetPoints[i];
        return sp.map((v, j) => v + (tp[j] - v) * ease);
      });
      this.#pathEl.setAttribute('d', this.#buildPath(current));
      if (t < 1) this.#frameId = requestAnimationFrame(step);
    };
    this.#frameId = requestAnimationFrame(step);
  }

  #parsePath(d) {
    if (!d) return null;
    const parts = d.match(/[ML]\s*[\d.-]+(\s*[\d.-]+)*/g);
    if (!parts) return null;
    return parts.map(p => {
      const [cmd, ...nums] = p.trim().split(/\s+/);
      return [cmd, ...nums.map(Number)];
    });
  }

  #buildPath(points) {
    return points.map(p => p.join(' ')).join(' ');
  }
}

export const morphLogo = new MorphLogo();
