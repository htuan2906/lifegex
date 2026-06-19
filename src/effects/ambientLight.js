/* Task 46: Ambient Light (mouse-follow) */
class AmbientLight {
  #el = null;

  init() {
    this.#el = document.createElement('div');
    this.#el.style.cssText = `
      position: fixed; inset: 0; pointer-events: none;
      z-index: 0; transition: background 0.5s;
      background: radial-gradient(600px at 50% 50%, rgba(163,31,52,0.03), transparent);
    `;
    document.body.prepend(this.#el);

    document.addEventListener('mousemove', (e) => {
      this.#el.style.background = `radial-gradient(600px at ${e.clientX}px ${e.clientY}px, rgba(163,31,52,0.06), transparent)`;
    });
  }

  destroy() {
    this.#el?.remove();
  }
}

export const ambientLight = new AmbientLight();

/* Task 44 (related): Sparkle Trail */
class SparkleTrail {
  #active = true;
  #lastTime = 0;

  init() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.addEventListener('mousemove', (e) => {
      if (!this.#active) return;
      const now = Date.now();
      if (now - this.#lastTime < 60) return;
      this.#lastTime = now;
      this.#spawn(e.clientX, e.clientY);
    });
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

    if (typeof gsap !== 'undefined') {
      gsap.to(s, {
        opacity: 0, y: -20, duration: 1.2,
        ease: 'power2.out',
        onComplete: () => s.remove(),
      });
    } else {
      let opacity = 0.6, y = y;
      const interv = setInterval(() => {
        opacity -= 0.05;
        y -= 1;
        s.style.opacity = opacity;
        s.style.top = `${y}px`;
        if (opacity <= 0) { clearInterval(interv); s.remove(); }
      }, 16);
    }
  }

  enable() { this.#active = true; }
  disable() { this.#active = false; }
}

export const sparkleTrail = new SparkleTrail();
