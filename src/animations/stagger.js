/* Task 12: Stagger Orchestration Engine */
class StaggerEngine {
  #queue = new Map();
  #running = new Set();

  add(name, elements, config = {}) {
    this.#queue.set(name, { elements, config });
  }

  async play(name) {
    if (this.#running.has(name)) return;
    this.#running.add(name);
    const item = this.#queue.get(name);
    if (!item) return;

    const { elements, config } = item;
    const {
      from = 0,
      stagger = 80,
      direction = 'forward',
      easing = (t) => 1 - Math.pow(1 - t, 3),
      onStart,
      onComplete,
    } = config;

    const els = Array.from(elements);
    const indices = direction === 'reverse' ? els.map((_, i) => els.length - 1 - i) : els.map((_, i) => i);
    const totalDuration = indices.length * stagger;

    onStart?.();

    for (let i = 0; i < indices.length; i++) {
      const el = els[indices[i]];
      const delay = from + i * stagger;

      await new Promise((resolve) => {
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          resolve();
        }, delay);
      });
    }

    await new Promise((r) => setTimeout(r, 100));
    onComplete?.();
    this.#running.delete(name);
  }

  async playAll() {
    for (const [name] of this.#queue) {
      await this.play(name);
    }
  }

  clear(name) {
    if (name) this.#queue.delete(name);
    else this.#queue.clear();
  }
}

export const staggerEngine = new StaggerEngine();
