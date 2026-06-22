/* Component: Hero Section */
import { BaseComponent } from './BaseComponent.js';
import { revealEngine } from '../animations/reveal.js';

export class HeroSection extends BaseComponent {
  mount() {
    this.heroTitle = this.$('#heroTitle');
    revealEngine.observe(this);
  }

  destroy() {}
}

BaseComponent.define('hero-section', HeroSection);
