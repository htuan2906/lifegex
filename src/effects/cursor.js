/* Task 14 (enhanced): Custom cursor with SVG particle trail */
import { config } from '../utils/config.js';
import { store } from '../state/store.js';
import gsap from 'gsap';

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

    this._mouseHandler = (e) => this.#onMouse(e);
    document.addEventListener('mousemove', this._mouseHandler);
    this.#bindInteractives();

    // Hide on touch devices
    if (matchMedia('(pointer: coarse)').matches) {
      this.#dot.style.display = 'none';
      this.#ring.style.display = 'none';
    }
  }

  #onMouse(e) {
    const x = e.clientX, y = e.clientY;

    gsap.to(this.#dot, {
      x, y, duration: 0.1, ease: 'power2.out', overwrite: 'auto',
    });
    gsap.to(this.#ring, {
      x, y, duration: 0.3, ease: 'power2.out', overwrite: 'auto',
    });

    if (this.#trailActive) this.#spawnTrail(x, y);
  }

  #bindInteractives() {
    this._interactiveListeners = [];
    document.querySelectorAll('a, button, .magnetic, .venture-card, .funds-card, .value-card, .about-card, .team-card, .platform-item').forEach(el => {
      const onEnter = () => { this.#dot?.classList.add('hover'); this.#ring?.classList.add('hover'); };
      const onLeave = () => { this.#dot?.classList.remove('hover'); this.#ring?.classList.remove('hover'); };
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
      this._interactiveListeners.push({ el, onEnter, onLeave });
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
    gsap.to(p, {
      opacity: 0, y: -16, duration: 0.8, ease: 'power2.out',
      onComplete: () => { p.remove(); this.#trailParticles = this.#trailParticles.filter(t => t !== p); },
    });
  }

  enableTrail() { this.#trailActive = true; }
  disableTrail() { this.#trailActive = false; }
  destroy() {
    this.#trailParticles.forEach(p => p.remove());
    this.#trailParticles = [];
    if (this._mouseHandler) document.removeEventListener('mousemove', this._mouseHandler);
    if (this._interactiveListeners) {
      this._interactiveListeners.forEach(({ el, onEnter, onLeave }) => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
      this._interactiveListeners = null;
    }
  }
}

export const cursorFX = new CursorFX();
