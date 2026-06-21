/* Component: Navigation (hamburger + theme toggle + lang) */
import { BaseComponent } from './BaseComponent.js';
import { store } from '../state/store.js';
import { observerPool } from '../utils/observer.js';
import { a11y } from '../utils/a11y.js';

export class AppNavigation extends BaseComponent {
  mount() {
    this.hamburger = this.$('#hamburger');
    this.navLinks = this.$('.nav-links');
    this.themeToggle = this.$('#themeToggle');
    this.langBtn = this.$('#langBtn');
    this.langDropdown = this.$('#langDropdown');

    this.#bindHamburger();
    this.#bindTheme();
    this.#bindLang();
    this.#bindNavClicks();
    this.#bindScroll();
  }

  #bindHamburger() {
    if (!this.hamburger || !this.navLinks) return;
    this.on(this.hamburger, 'click', () => {
      const open = this.navLinks.classList.toggle('open');
      this.hamburger.classList.toggle('active');
      store.set('menuOpen', open);
      a11y.setAriaExpanded(this.hamburger, open);
      if (open) a11y.announce('Navigation menu opened');
    });

    this.$$('.nav-links a').forEach(a => {
      this.on(a, 'click', () => {
        this.navLinks.classList.remove('open');
        this.hamburger.classList.remove('active');
        store.set('menuOpen', false);
      });
    });
  }

  #bindTheme() {
    if (!this.themeToggle) return;
    this.on(this.themeToggle, 'click', () => {
      document.body.classList.toggle('dark');
      const isDark = document.body.classList.contains('dark');
      this.themeToggle.textContent = isDark ? '\u2600' : '\uD83C\uDF19';
      store.set('theme', isDark ? 'dark' : 'light');
      try { localStorage.setItem('lgx-theme', isDark ? 'dark' : 'light'); } catch {}
      a11y.announce(isDark ? 'Dark mode enabled' : 'Light mode enabled');
    });

    try {
      const saved = localStorage.getItem('lgx-theme');
      if (saved === 'dark') {
        document.body.classList.add('dark');
        this.themeToggle.textContent = '\u2600';
        store.set('theme', 'dark');
      }
    } catch {}
  }

  #bindLang() {
    if (!this.langBtn || !this.langDropdown) return;
    this.on(this.langBtn, 'click', (e) => {
      e.stopPropagation();
      this.langDropdown.classList.toggle('show');
      a11y.setAriaExpanded(this.langBtn, this.langDropdown.classList.contains('show'));
    });

    this.on(document, 'click', () => this.langDropdown?.classList.remove('show'));
    this.on(this.langDropdown, 'click', (e) => e.stopPropagation());
  }

  #bindNavClicks() {
    this.$$('.nav-links a[href^="#"]').forEach(a => {
      this.on(a, 'click', (e) => {
        const h = a.getAttribute('href');
        if (h === '#') return;
        e.preventDefault();
        const t = document.querySelector(h);
        if (!t) return;
        store.set('activeSection', h.replace('#', ''));
        const lenis = store.get('lenis');
        if (lenis) {
          lenis.scrollTo(t, { duration: 1.2, offset: -68 });
        } else {
          t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  #bindScroll() {
    const sections = document.querySelectorAll('section[id]');
    if (sections.length === 0) return;

    this.on(window, 'scroll', () => {
      let cur = '';
      sections.forEach(s => {
        const t = s.offsetTop - 120;
        if (window.scrollY >= t) cur = s.id;
      });
      this.$$('.nav-links a[href^="#"]').forEach(a => {
        const isActive = a.getAttribute('href') === '#' + cur;
        a.classList.toggle('active', isActive);
        if (isActive) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
    });
  }
}

BaseComponent.define('app-navigation', AppNavigation);
