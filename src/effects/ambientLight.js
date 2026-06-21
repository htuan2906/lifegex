import gsap from 'gsap';

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

    let ticking = false;
    this._mouseHandler = (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.#el.style.background = `radial-gradient(600px at ${e.clientX}px ${e.clientY}px, rgba(163,31,52,0.06), transparent)`;
          ticking = false;
        });
        ticking = true;
      }
    };
    document.addEventListener('mousemove', this._mouseHandler);
  }

  destroy() {
    this.#el?.remove();
    if (this._mouseHandler) document.removeEventListener('mousemove', this._mouseHandler);
  }
}

export const ambientLight = new AmbientLight();
