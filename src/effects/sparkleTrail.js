import gsap from 'gsap';

class SparkleTrail {
  #active = true;
  #lastTime = 0;
  #mouseHandler = null;

  init() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.#mouseHandler = (e) => {
      if (!this.#active) return;
      const now = Date.now();
      if (now - this.#lastTime < 60) return;
      this.#lastTime = now;
      this.#spawn(e.clientX, e.clientY);
    };
    document.addEventListener('mousemove', this.#mouseHandler);
  }

  #spawn(x, y) {
    const s = document.createElement('span');
    s.style.cssText = `
      position: fixed; left: ${x}px; top: ${y}px;
      width: 3px; height: 3px; background: var(--red);
      border-radius: 50%; pointer-events: none;
      z-index: 9995; opacity: 0.6;
    `;
    document.body.appendChild(s);

    gsap.to(s, {
      opacity: 0, y: -20, duration: 1.2,
      ease: 'power2.out',
      onComplete: () => s.remove(),
    });
  }

  enable() { this.#active = true; }
  disable() { this.#active = false; }
  destroy() {
    if (this.#mouseHandler) document.removeEventListener('mousemove', this.#mouseHandler);
  }
}

export const sparkleTrail = new SparkleTrail();
