/* Task 14 (enhanced): Custom cursor with SVG particle trail */
import { config } from '../utils/config.js';
import { store } from '../state/store.js';

class CursorFX {
  #dot = null;
  #ring = null;
  #trailActive = false;
  #trailParticles = [];
  #maxTrail = 12;
  #raf = null;

  init() {
    if (!config.features.cursorFX) return;
    this.#dot = document.getElementById('cursorDot');
    this.#ring = document.getElementById('cursorRing');
    if (!this.#dot || !this.#ring) return;

    document.addEventListener('mousemove', (e) => this.#onMouse(e));
    this.#bindInteractives();

    // Hide on touch devices
    if (matchMedia('(pointer: coarse)').matches) {
      this.#dot.style.display = 'none';
      this.#ring.style.display = 'none';
    }
  }

  #onMouse(e) {
    const x = e.clientX, y = e.clientY;

    gsap?.to(this.#dot, {
      x, y, duration: 0.1, ease: 'power2.out', overwrite: 'auto',
    });
    gsap?.to(this.#ring, {
      x, y, duration: 0.3, ease: 'power2.out', overwrite: 'auto',
    });

    if (this.#trailActive) this.#spawnTrail(x, y);
  }

  #bindInteractives() {
    document.querySelectorAll('a, button, .magnetic, .venture-card, .funds-card, .value-card, .about-card, .team-card, .platform-item').forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.#dot?.classList.add('hover');
        this.#ring?.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        this.#dot?.classList.remove('hover');
        this.#ring?.classList.remove('hover');
      });
    });
  }

  #spawnTrail(x, y) {
    const p = document.createElement('span');
    p.style.cssText = `
      position: fixed; left: ${x}px; top: ${y}px;
      width: 4px; height: 4px; border-radius: 50%;
      background: var(--red); pointer-events: none;
      z-index: 9995; opacity: 0.4;
    `;
    document.body.appendChild(p);
    this.#trailParticles.push(p);
    if (this.#trailParticles.length > this.#maxTrail) {
      this.#trailParticles.shift()?.remove();
    }
    gsap?.to(p, {
      opacity: 0, y: -16, duration: 0.8, ease: 'power2.out',
      onComplete: () => { p.remove(); this.#trailParticles = this.#trailParticles.filter(t => t !== p); },
    });
  }

  enableTrail() { this.#trailActive = true; }
  disableTrail() { this.#trailActive = false; }
  destroy() {
    this.#trailParticles.forEach(p => p.remove());
    this.#trailParticles = [];
  }
}

export const cursorFX = new CursorFX();
