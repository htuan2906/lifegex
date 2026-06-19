/* Task 35: App orchestrator — initializes all subsystems */
import { store } from './state/store.js';
import { appMachine } from './state/machine.js';
import { historyStack } from './state/history.js';
import { i18n } from './utils/i18n.js';
import { db } from './utils/db.js';
import { keyboard } from './utils/keyboard.js';
import { observerPool } from './utils/observer.js';
import { urlSync } from './utils/url.js';
import { a11y } from './utils/a11y.js';
import { config } from './utils/config.js';
import { debounce, throttle } from './utils/dom.js';

import { lenisScroll } from './animations/lenisScroll.js';
import { revealEngine } from './animations/reveal.js';
import { textSplitter } from './animations/textSplit.js';
import { parallaxEngine } from './animations/parallax.js';
import { cardTilt } from './animations/cardTilt.js';
import { morphLogo } from './animations/morphLogo.js';
import { scrollDriven } from './animations/scrollDriven.js';
import { flicTransition } from './animations/flicTransition.js';
import { staggerEngine } from './animations/stagger.js';

import { cursorFX } from './effects/cursor.js';
import { particleBackground } from './effects/particles.js';
import { fluidSim } from './effects/fluidSim.js';
import { noiseOverlay } from './effects/noiseOverlay.js';
import { ambientLight } from './effects/ambientLight.js';
import { sparkleTrail } from './effects/ambientLight.js';

import './components/Navigation.js';
import './components/HeroSection.js';
import './components/AboutSection.js';
import './components/Timeline.js';
import './components/FundsChart.js';
import './components/MetricsCounter.js';
import './components/CoverflowCarousel.js';
import './components/BackToTop.js';
import './components/CommandPalette.js';
import './components/ExitIntent.js';
import './components/StickyNavIndicator.js';
import './components/DragReorder.js';

export class App {
  async init() {
    store.set('loading', true);

    // Init DB
    try { await db.init(); } catch {}

    // Init i18n
    await i18n.init();

    // Accessibility
    a11y.createSkipLink();

    // Scroll
    if (!store.get('reducedMotion')) {
      this.#initScroll();
    }

    // Visual effects
    this.#initEffects();

    // Animations
    this.#initAnimations();

    // Components
    this.#initComponents();

    // Loader
    this.#hideLoader();

    // Service Worker
    if (config.features.serviceWorker) {
      this.#registerSW();
    }

    // Keyboard shortcuts
    keyboard.register('Cmd+K', () => store.set('commandOpen', true));
    keyboard.register('Escape', () => {
      store.set('commandOpen', false);
      store.set('menuOpen', false);
    });

    // URL sync
    urlSync.onChange((params) => {
      if (params.lang) i18n.setLocale(params.lang);
      if (params.section) {
        const el = document.querySelector(`#${params.section}`);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    });

    // State machine
    appMachine.transition('LOADED');
    store.set('loading', false);
    store.set('loaded', true);

    // Mark main content
    document.getElementById('main')?.setAttribute('role', 'main');

    console.log(`[LifeGex] v${config.app.version} initialized`);
  }

  #initScroll() {
    try {
      lenisScroll.init();
    } catch (e) {
      console.warn('[LifeGex] Lenis init failed, using native scroll', e);
    }
  }

  #initEffects() {
    cursorFX.init();
    particleBackground.init();
    noiseOverlay.init();
    ambientLight.init();
    sparkleTrail.init();
    if (store.get('reducedMotion')) {
      cursorFX.disableTrail();
      sparkleTrail.disable();
    }
    // fluidSim.init(); // uncomment when needed
  }

  #initAnimations() {
    revealEngine.observe(document);
    textSplitter.splitAll(document);
    parallaxEngine.init();
    cardTilt.init();
    morphLogo.init();
    scrollDriven.init();
  }

  #initComponents() {
    // Component-specific inits happen via Custom Elements automatically
    document.querySelectorAll('[data-split]').forEach(el => {
      textSplitter.split(el, { type: el.dataset.split });
    });
  }

  #hideLoader() {
    const hide = () => {
      const loader = document.getElementById('loader');
      if (loader) loader.classList.add('hidden');
    };
    window.addEventListener('load', () => setTimeout(hide, 800));
    setTimeout(hide, 4000);
    window.addEventListener('error', hide);
  }

  #registerSW() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
  }

  destroy() {
    lenisScroll.destroy();
    particleBackground.destroy();
    noiseOverlay.destroy();
    fluidSim.destroy();
    ambientLight.destroy();
    cursorFX.destroy();
  }
}

export const app = new App();
