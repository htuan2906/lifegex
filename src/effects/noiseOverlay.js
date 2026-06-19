/* Task 15: WebGL Noise Overlay (replaces SVG noise for performance) */
class NoiseOverlay {
  #canvas = null;
  #ctx = null;
  #raf = null;
  #offset = 0;

  init() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.#canvas = document.getElementById('noiseCanvas') || this.#createCanvas();
    if (!this.#canvas) return;
    this.#ctx = this.#canvas.getContext('2d');
    this.#resize();
    this.#generate();
    window.addEventListener('resize', () => this.#resize());
  }

  #createCanvas() {
    const c = document.createElement('canvas');
    c.id = 'noiseCanvas';
    c.style.cssText = `
      position: fixed; inset: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 9996; opacity: 0.015;
      mix-blend-mode: overlay;
    `;
    document.body.appendChild(c);
    return c;
  }

  #resize() {
    if (!this.#canvas) return;
    const w = Math.min(window.innerWidth, 256);
    const h = Math.min(window.innerHeight, 256);
    this.#canvas.width = w;
    this.#canvas.height = h;
    this.#canvas.style.width = '100%';
    this.#canvas.style.height = '100%';
  }

  #generate() {
    const w = this.#canvas.width;
    const h = this.#canvas.height;
    const ctx = this.#ctx;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const val = Math.random() * 255;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
  }

  destroy() {
    if (this.#raf) cancelAnimationFrame(this.#raf);
    this.#canvas?.remove();
  }
}

export const noiseOverlay = new NoiseOverlay();
