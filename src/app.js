/* Task 35: App orchestrator — initializes all subsystems */
import { store } from './state/store.js';
import { appMachine } from './state/machine.js';
import { i18n } from './utils/i18n.js';
import { db } from './utils/db.js';
import { keyboard } from './utils/keyboard.js';
import { urlSync } from './utils/url.js';
import { a11y } from './utils/a11y.js';
import { config } from './utils/config.js';

import { lenisScroll } from './animations/lenisScroll.js';
import { revealEngine } from './animations/reveal.js';
import { textSplitter } from './animations/textSplit.js';
import { parallaxEngine } from './animations/parallax.js';
import { cardTilt } from './animations/cardTilt.js';
import { morphLogo } from './animations/morphLogo.js';
import { scrollDriven } from './animations/scrollDriven.js';

import { cursorFX } from './effects/cursor.js';
import { sparkleTrail } from './effects/sparkleTrail.js';

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

    try {
      try { await db.init(); } catch {}
      try {
        const requestedLocale = urlSync.get('lang');
        if (requestedLocale) await i18n.setLocale(requestedLocale);
        else await i18n.init();
      } catch { console.warn('[LifeGex] i18n init failed'); }
      window.setLang = (locale) => i18n.setLocale(locale);
      const syncLanguageControl = () => {
        const labels = { en: 'EN', zh: '中文', es: 'ES', fr: 'FR', vi: 'VI' };
        const current = document.getElementById('langCurrent');
        if (current) current.textContent = labels[i18n.locale] || i18n.locale.toUpperCase();
        document.querySelectorAll('#langDropdown [data-lang]').forEach((item) => {
          const active = item.dataset.lang === i18n.locale;
          item.classList.toggle('active', active);
          item.setAttribute('aria-selected', String(active));
        });
      };
      syncLanguageControl();
      i18n.on('change', () => {
        syncLanguageControl();
        const heroTitle = document.getElementById('heroTitle');
        if (!heroTitle) return;
        delete heroTitle.dataset.splitDone;
        textSplitter.split(heroTitle, { type: 'chars', stagger: 20 });
      });
      a11y.createSkipLink();

      if (config.features.smoothScroll && !store.get('reducedMotion')) {
        this.#initScroll();
      }
      this.#initEffects();
      this.#initAnimations();

      if (config.features.serviceWorker) {
        this.#registerSW();
      }

      keyboard.register('Cmd+K', () => store.set('commandOpen', true));
      keyboard.register('Escape', () => {
        store.set('commandOpen', false);
        store.set('menuOpen', false);
      });
      urlSync.onChange((params) => {
        if (params.lang) i18n.setLocale(params.lang);
        if (params.section) {
          const el = document.querySelector(`#${params.section}`);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      });
      appMachine.transition('LOADED');
      store.set('loading', false);
      store.set('loaded', true);
      document.getElementById('main')?.setAttribute('role', 'main');
    } catch (e) {
      console.error('[LifeGex] Init error:', e);
    } finally {
      this.#hideLoader();
    }
  }

  #initScroll() {
    try { lenisScroll.init(); } catch (e) { console.warn('[LifeGex] Lenis init failed, using native scroll', e); }
  }

  #initEffects() {
    if (config.features.cursorFX) {
      try { cursorFX.init(); } catch (e) { console.warn('[LifeGex] cursorFX:', e); }
    }
    if (config.features.sparkleTrail) {
      try { sparkleTrail.init(); } catch (e) { console.warn('[LifeGex] sparkleTrail:', e); }
    }
    if (store.get('reducedMotion')) {
      cursorFX.disableTrail();
      sparkleTrail.disable();
    }
  }

  #initAnimations() {
    try { revealEngine.observe(document); } catch (e) { console.warn('[LifeGex] reveal:', e); }
    try { textSplitter.splitAll(document); } catch (e) { console.warn('[LifeGex] textSplit:', e); }
    try { parallaxEngine.init(); } catch (e) { console.warn('[LifeGex] parallax:', e); }
    try { cardTilt.init(); } catch (e) { console.warn('[LifeGex] cardTilt:', e); }
    try { morphLogo.init(); } catch (e) { console.warn('[LifeGex] morphLogo:', e); }
    try { scrollDriven.init(); } catch (e) { console.warn('[LifeGex] scrollDriven:', e); }
  }

  #hideLoader() {
    const hide = () => {
      const loader = document.getElementById('loader');
      if (loader) loader.classList.add('hidden');
    };
    setTimeout(hide, 600);
    setTimeout(hide, 3000);
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
    sparkleTrail.destroy();
    cursorFX.destroy();
    i18n.destroy();
    keyboard.destroy();
  }
}

export const app = new App();
