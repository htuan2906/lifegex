/* Component: 3D Coverflow Carousel */
import { BaseComponent } from './BaseComponent.js';
import { GestureEngine } from '../utils/gestures.js';
import gsap from 'gsap';

export class CoverflowCarousel extends BaseComponent {
  mount() {
    this.track = this.$('#carouselTrack');
    this.cards = this.$$('.carousel-card');
    this.dots = document.querySelectorAll('#carouselDots button');
    this.prevBtn = this.$('#carouselPrev');
    this.nextBtn = this.$('#carouselNext');
    this.idx = 0;
    this.autoTimer = null;

    if (this.cards.length === 0) return;
    this.#layout();
    this.#bindControls();
    this.#startAuto();
  }

  #layout() {
    this.cards.forEach((card, i) => {
      const diff = i - this.idx;
      const scale = 1 - Math.abs(diff) * 0.12;
      const z = diff * 120;
      const x = diff * 140;
      const opacity = 1 - Math.abs(diff) * 0.35;

      gsap.to(card, {
        scale: Math.max(scale, 0.6),
        x: Math.round(x),
        z: Math.round(z),
        opacity: Math.max(opacity, 0.3),
        duration: 0.8,
        ease: 'power3.out',
        overwrite: 'auto',
      });
      card.style.pointerEvents = diff === 0 ? 'auto' : 'none';
    });

    this.dots.forEach((d, i) => d.classList.toggle('active', i === this.idx));
  }

  #bindControls() {
    this.on(this.nextBtn, 'click', () => this.#next());
    this.on(this.prevBtn, 'click', () => this.#prev());
    this.dots.forEach((d, i) => this.on(d, 'click', () => { this.idx = i; this.#layout(); }));

    // Touch gesture
    const gestures = new GestureEngine(this);
    gestures.on('swipeleft', () => this.#next());
    gestures.on('swiperight', () => this.#prev());
  }

  #next() {
    this.idx = (this.idx + 1) % this.cards.length;
    this.#layout();
    this.#resetAuto();
  }

  #prev() {
    this.idx = (this.idx - 1 + this.cards.length) % this.cards.length;
    this.#layout();
    this.#resetAuto();
  }

  #startAuto() {
    if (this.autoTimer) clearInterval(this.autoTimer);
    this.autoTimer = setInterval(() => this.#next(), 5000);
    // Only bind mouseleave once
    if (!this._autoBound) {
      this._autoBound = true;
      this.on(this, 'mouseenter', () => { if (this.autoTimer) clearInterval(this.autoTimer); });
      this.on(this, 'mouseleave', () => this.#startAuto());
    }
  }

  #resetAuto() {
    clearInterval(this.autoTimer);
    this.autoTimer = null;
    this.#startAuto();
  }

  destroy() {
    if (this.autoTimer) clearInterval(this.autoTimer);
    this._autoBound = false;
  }
}

BaseComponent.define('coverflow-carousel', CoverflowCarousel);
