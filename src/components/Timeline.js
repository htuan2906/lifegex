/* Component: Timeline (horizontal draggable scroller) */
import { BaseComponent } from './BaseComponent.js';
import { observerPool } from '../utils/observer.js';
import { GestureEngine } from '../utils/gestures.js';

export class TimelineSection extends BaseComponent {
  mount() {
    if (this.dataset.layout === 'horizontal') {
      this.#initHorizontal();
    } else {
      this.#initVertical();
    }
  }

  #initVertical() {
    observerPool.create('timeline', { threshold: 0.15, once: true });
    this.$$('.tl-item').forEach(el => {
      observerPool.observe('timeline', el, (entry) => {
        setTimeout(() => el.classList.add('show'), el.dataset.delay * 200);
      });
    });
  }

  #initHorizontal() {
    const track = this.$('.timeline-track');
    if (!track) return;

    track.style.cssText = `
      display: flex; gap: 32px; overflow-x: auto;
      scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;
      scrollbar-width: none; padding: 0 var(--space-lg);
      cursor: grab; user-select: none;
    `;

    this.$$('.tl-item').forEach(el => {
      el.style.cssText = `
        flex: 0 0 300px; scroll-snap-align: start;
        opacity: 0; transform: translateY(20px);
        transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      `;
    });

    // Mini-map
    const miniMap = document.createElement('div');
    miniMap.className = 'timeline-minimap';
    miniMap.style.cssText = `
      display: flex; gap: 6px; justify-content: center; margin-top: 24px;
    `;
    this.$$('.tl-item').forEach((_, i) => {
      const dot = document.createElement('span');
      dot.style.cssText = `
        width: 8px; height: 8px; border-radius: 50%;
        background: var(--red); opacity: 0.2; transition: all 0.3s;
        cursor: pointer;
      `;
      dot.addEventListener('click', () => {
        track.children[i]?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      });
      miniMap.appendChild(dot);
    });
    this.appendChild(miniMap);

    // Gesture support
    const gestures = new GestureEngine(track);
    gestures.on('swipeleft', () => { track.scrollLeft += 300; });
    gestures.on('swiperight', () => { track.scrollLeft -= 300; });

    // Show items on scroll
    const showObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.3 });

    this.$$('.tl-item').forEach(el => showObs.observe(el));
  }
}

BaseComponent.define('timeline-section', TimelineSection);
