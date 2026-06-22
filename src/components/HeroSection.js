/* Component: Hero Section */
import { BaseComponent } from './BaseComponent.js';
import { textSplitter } from '../animations/textSplit.js';
import { revealEngine } from '../animations/reveal.js';

export class HeroSection extends BaseComponent {
  mount() {
    this.heroTitle = this.$('#heroTitle');
    revealEngine.observe(this);
    if (this.heroTitle) textSplitter.split(this.heroTitle, { type: 'chars', stagger: 20 });
  }

  destroy() {}
}

BaseComponent.define('hero-section', HeroSection);
