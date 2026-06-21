/* Component: Back to Top */
import { BaseComponent } from './BaseComponent.js';

export class BackToTop extends BaseComponent {
  mount() {
    this.on(window, 'scroll', () => {
      this.classList.toggle('visible', window.scrollY > 600);
    });
    this.on(this, 'click', () => {
      if (window.lenis) {
        window.lenis.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}

BaseComponent.define('back-to-top', BackToTop);

