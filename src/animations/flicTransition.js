/* Task 16 (second part): FLIC Page Transitions (View Transition API + fallback) */
import { store } from '../state/store.js';

class FlicTransition {
  #supportsVT = !!document.startViewTransition;
  #transitioning = false;

  async navigate(url, updateDOM) {
    if (this.#transitioning) return;
    this.#transitioning = true;

    if (this.#supportsVT) {
      const t = document.startViewTransition(async () => {
        await updateDOM();
      });
      await t.finished;
    } else {
      await this.#fallback(updateDOM);
    }

    this.#transitioning = false;
  }

  async #fallback(updateDOM) {
    const pt = document.getElementById('pageTransition');
    if (pt) {
      pt.style.opacity = '1';
      pt.style.transform = 'scale(0.98)';
    }

    await this.#sleep(300);
    await updateDOM();

    if (pt) {
      pt.style.opacity = '0';
      pt.style.transform = 'scale(1)';
    }
    await this.#sleep(400);
  }

  #sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  async scrollToSection(target, offset = 0) {
    if (this.#transitioning) return;
    const t = document.querySelector(target);
    if (!t) return;

    const updateDOM = async () => {
      store.set('activeSection', target.replace('#', ''));
      if (window.lenis) {
        window.lenis.scrollTo(t, { offset, duration: 1.2, immediate: this.#supportsVT });
        await this.#sleep(1200);
      } else {
        t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        await this.#sleep(800);
      }
    };

    await this.navigate(target, updateDOM);
  }
}

export const flicTransition = new FlicTransition();
