/* Task 18: Lenis Smooth Scroll Configuration */
import Lenis from 'lenis';
import { store } from '../state/store.js';

class LenisScroll {
  #instance = null;

  get instance() { return this.#instance; }

  init(opts = {}) {
    this.#instance = new Lenis({
      duration: opts.duration ?? 1.2,
      easing: opts.easing ?? ((t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: opts.wheelMultiplier ?? 1,
      touchMultiplier: opts.touchMultiplier ?? 1.5,
      infinite: false,
      autoResize: true,
      ...opts,
    });

    this.#instance.on('scroll', (e) => {
      store.set('scrollY', e.animatedScroll ?? e.scroll);
      document.getElementById('navbar')?.classList.toggle('scrolled', e.scroll > 60);
    });

    const raf = (time) => {
      if (!this.#instance) return;
      this.#instance.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    store.set('lenis', this.#instance);
    return this.#instance;
  }

  scrollTo(target, opts = {}) {
    if (!this.#instance) return;
    this.#instance.scrollTo(target, {
      duration: opts.duration ?? 1.2,
      offset: opts.offset ?? 0,
      immediate: opts.immediate ?? false,
      lock: true,
      ...opts,
    });
  }

  destroy() {
    if (this.#instance) {
      this.#instance.destroy();
      this.#instance = null;
    }
  }
}

export const lenisScroll = new LenisScroll();
