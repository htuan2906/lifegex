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

/* Component: Theme Toggle */
export class ThemeToggleButton extends BaseComponent {
  mount() {
    this.on(this, 'click', () => {
      document.body.classList.toggle('dark');
      const isDark = document.body.classList.contains('dark');
      this.textContent = isDark ? '\u2600' : '\uD83C\uDF19';
      try { localStorage.setItem('lgx-theme', isDark ? 'dark' : 'light'); } catch {}
    });

    try {
      if (localStorage.getItem('lgx-theme') === 'dark') {
        document.body.classList.add('dark');
        this.textContent = '\u2600';
      }
    } catch {}
  }
}

BaseComponent.define('theme-toggle', ThemeToggleButton);
