/* Component: Hero Section */
import { BaseComponent } from './BaseComponent.js';
import { revealEngine } from '../animations/reveal.js';

export class HeroSection extends BaseComponent {
  #canvas = null;
  #ctx = null;
  #nodes = [];
  #raf = null;
  #resizeObserver = null;
  #visibilityObserver = null;
  #active = true;
  #lastFrame = 0;
  #pointer = { x: 0.5, y: 0.5 };

  mount() {
    this.heroTitle = this.$('#heroTitle');
    revealEngine.observe(this);
    this.#canvas = this.$('#hero3dCanvas');
    if (this.#canvas) this.#initNetwork();
  }

  #initNetwork() {
    this.#ctx = this.#canvas.getContext('2d', { alpha: true });
    if (!this.#ctx) return;

    const count = window.innerWidth < 900 ? 18 : 34;
    this.#nodes = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00012,
      vy: (Math.random() - 0.5) * 0.00012,
      size: 1.5 + Math.random() * 2.8,
      phase: Math.random() * Math.PI * 2,
    }));

    this._pointerMove = (event) => {
      const rect = this.#canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      this.#pointer.x = (event.clientX - rect.left) / rect.width;
      this.#pointer.y = (event.clientY - rect.top) / rect.height;
    };
    this.#canvas.parentElement?.addEventListener('pointermove', this._pointerMove, { passive: true });

    this.#resizeObserver = new ResizeObserver(() => this.#resize());
    this.#resizeObserver.observe(this.#canvas.parentElement || this.#canvas);
    this.#visibilityObserver = new IntersectionObserver(([entry]) => {
      this.#active = entry.isIntersecting;
      if (this.#active && !this.#raf) this.#raf = requestAnimationFrame((time) => this.#draw(time));
    }, { rootMargin: '100px' });
    this.#visibilityObserver.observe(this.#canvas);

    this._visibilityChange = () => {
      this.#active = !document.hidden;
      if (this.#active && !this.#raf) this.#raf = requestAnimationFrame((time) => this.#draw(time));
    };
    document.addEventListener('visibilitychange', this._visibilityChange);
    this.#resize();
    this.#draw(0);
  }

  #resize() {
    const rect = this.#canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.#canvas.width = Math.max(1, Math.round(rect.width * dpr));
    this.#canvas.height = Math.max(1, Math.round(rect.height * dpr));
    this.#ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  #draw(time) {
    this.#raf = null;
    if (!this.#ctx || !this.#canvas) return;
    if (time && time - this.#lastFrame < 33) {
      if (this.#active) this.#raf = requestAnimationFrame((next) => this.#draw(next));
      return;
    }
    this.#lastFrame = time;

    const rect = this.#canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    this.#ctx.clearRect(0, 0, width, height);

    const glow = this.#ctx.createRadialGradient(
      width * this.#pointer.x, height * this.#pointer.y, 0,
      width * 0.5, height * 0.5, Math.max(width, height) * 0.72
    );
    glow.addColorStop(0, 'rgba(184, 58, 58, 0.13)');
    glow.addColorStop(0.55, 'rgba(163, 31, 52, 0.045)');
    glow.addColorStop(1, 'rgba(163, 31, 52, 0)');
    this.#ctx.fillStyle = glow;
    this.#ctx.fillRect(0, 0, width, height);

    this.#nodes.forEach((node) => {
      node.x += node.vx * 33;
      node.y += node.vy * 33;
      if (node.x < 0.04 || node.x > 0.96) node.vx *= -1;
      if (node.y < 0.04 || node.y > 0.96) node.vy *= -1;
      node.x = Math.max(0.03, Math.min(0.97, node.x));
      node.y = Math.max(0.03, Math.min(0.97, node.y));
    });

    for (let i = 0; i < this.#nodes.length; i++) {
      const a = this.#nodes[i];
      for (let j = i + 1; j < this.#nodes.length; j++) {
        const b = this.#nodes[j];
        const dx = (a.x - b.x) * width;
        const dy = (a.y - b.y) * height;
        const distance = Math.hypot(dx, dy);
        if (distance > 125) continue;
        this.#ctx.strokeStyle = `rgba(163, 31, 52, ${0.16 * (1 - distance / 125)})`;
        this.#ctx.lineWidth = 0.8;
        this.#ctx.beginPath();
        this.#ctx.moveTo(a.x * width, a.y * height);
        this.#ctx.lineTo(b.x * width, b.y * height);
        this.#ctx.stroke();
      }
    }

    this.#nodes.forEach((node) => {
      const pulse = 0.75 + Math.sin(time * 0.0018 + node.phase) * 0.25;
      this.#ctx.fillStyle = `rgba(163, 31, 52, ${0.35 + pulse * 0.35})`;
      this.#ctx.beginPath();
      this.#ctx.arc(node.x * width, node.y * height, node.size * pulse, 0, Math.PI * 2);
      this.#ctx.fill();
    });

    if (this.#active) this.#raf = requestAnimationFrame((next) => this.#draw(next));
  }

  destroy() {
    if (this.#raf) cancelAnimationFrame(this.#raf);
    this.#resizeObserver?.disconnect();
    this.#visibilityObserver?.disconnect();
    document.removeEventListener('visibilitychange', this._visibilityChange);
    this.#canvas?.parentElement?.removeEventListener('pointermove', this._pointerMove);
  }
}

BaseComponent.define('hero-section', HeroSection);
