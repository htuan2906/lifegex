/* Component: About Section (glass cards + reveal) */
import { BaseComponent } from './BaseComponent.js';
import { revealEngine } from '../animations/reveal.js';
import { cardTilt } from '../animations/cardTilt.js';

export class AboutSection extends BaseComponent {
  mount() {
    revealEngine.observe(this);
    cardTilt.init(this);
  }
}

BaseComponent.define('about-section', AboutSection);

/* Component: Value Cards */
export class ValueCard extends BaseComponent {
  mount() {
    revealEngine.observe(this);
  }
}

BaseComponent.define('value-card', ValueCard);

/* Component: Venture Cards */
export class VentureCard extends BaseComponent {
  mount() {
    revealEngine.observe(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.on(this, 'click', () => {
      const name = this.dataset.venture || 'venture';
      this.dispatchEvent(new CustomEvent('venture-select', {
        detail: { name },
        bubbles: true,
        composed: true,
      }));
    });
  }
}

BaseComponent.define('venture-card', VentureCard);
