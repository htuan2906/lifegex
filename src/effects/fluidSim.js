/* Task 21: WebGL Fluid Simulation Background (simplified) */
import { config } from '../utils/config.js';

class FluidSimulation {
  #canvas = null;
  #ctx = null;
  #particles = [];
  #raf = null;
  #mouse = { x: 0, y: 0, px: 0, py: 0 };

  init(canvasId = 'fluidCanvas') {
    if (!config.features.fluidSim) return;
    this.#canvas = document.getElementById(canvasId) || this.#createCanvas();
    if (!this.#canvas) return;

    this.#ctx = this.#canvas.getContext('2d');
    this.#resize();
    this.#createParticles(120);
    this.#bindMouse();
    this.#animate();
    this._resizeHandler = () => this.#resize();
    window.addEventListener('resize', this._resizeHandler);
  }

  #createCanvas() {
    const c = document.createElement('canvas');
    c.id = 'fluidCanvas';
    c.style.cssText = `
      position: fixed; inset: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 0; opacity: 0.3;
    `;
    document.body.prepend(c);
    return c;
  }

  #resize() {
    if (!this.#canvas) return;
    this.#canvas.width = window.innerWidth;
    this.#canvas.height = window.innerHeight;
  }

  #createParticles(count) {
    for (let i = 0; i < count; i++) {
      this.#particles.push({
        x: Math.random() * this.#canvas.width,
        y: Math.random() * this.#canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: 2 + Math.random() * 3,
        color: `hsla(${350 + Math.random() * 20}, 60%, ${30 + Math.random() * 20}%, ${0.3 + Math.random() * 0.3})`,
      });
    }
  }

  #bindMouse() {
    this._mouseHandler = (e) => {
      this.#mouse.px = this.#mouse.x;
      this.#mouse.py = this.#mouse.y;
      this.#mouse.x = e.clientX;
      this.#mouse.y = e.clientY;
    };
    document.addEventListener('mousemove', this._mouseHandler);
  }

  #animate() {
    const anim = () => {
      this.#raf = requestAnimationFrame(anim);
      const ctx = this.#ctx;
      const w = this.#canvas.width;
      const h = this.#canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Mouse influence
      const dx = this.#mouse.x - this.#mouse.px;
      const dy = this.#mouse.y - this.#mouse.py;
      const speed = Math.hypot(dx, dy);

      this.#particles.forEach(p => {
        // Mouse force
        const mdx = this.#mouse.x - p.x;
        const mdy = this.#mouse.y - p.y;
        const mdist = Math.hypot(mdx, mdy);
        if (mdist < 150 && mdist > 0) {
          p.vx += (mdx / mdist) * 0.05 * (speed > 5 ? 1 : 0.1);
          p.vy += (mdy / mdist) * 0.05 * (speed > 5 ? 1 : 0.1);
        }

        // Random walk
        p.vx += (Math.random() - 0.5) * 0.02;
        p.vy += (Math.random() - 0.5) * 0.02;

        // Damping
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Speed limit
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > 2) { p.vx = (p.vx / sp) * 2; p.vy = (p.vy / sp) * 2; }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < this.#particles.length; i++) {
        for (let j = i + 1; j < this.#particles.length; j++) {
          const dx = this.#particles[i].x - this.#particles[j].x;
          const dy = this.#particles[i].y - this.#particles[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(this.#particles[i].x, this.#particles[i].y);
            ctx.lineTo(this.#particles[j].x, this.#particles[j].y);
            ctx.strokeStyle = `rgba(163, 31, 52, ${0.1 * (1 - dist / 80)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };
    anim();
  }

  destroy() {
    if (this.#raf) cancelAnimationFrame(this.#raf);
    this.#canvas?.remove();
    if (this._mouseHandler) document.removeEventListener('mousemove', this._mouseHandler);
    if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
  }
}

export const fluidSim = new FluidSimulation();
