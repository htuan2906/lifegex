/* Task 40: Command Palette (Cmd+K) */
import { BaseComponent } from './BaseComponent.js';
import { store } from '../state/store.js';
import { a11y } from '../utils/a11y.js';

export class CommandPalette extends BaseComponent {
  mount() {
    this.input = this.$('input');
    this.results = this.$('.command-results');
    this.overlay = this.$('.command-overlay');
    this.#buildIndex();
    this.#bindEvents();
  }

  #buildIndex() {
    this.actions = [
      { label: 'Go to About', action: '#about', icon: 'ℹ️' },
      { label: 'Go to Ventures', action: '#ventures', icon: '🚀' },
      { label: 'Go to Timeline', action: '#timeline', icon: '📅' },
      { label: 'Go to Team', action: '#team', icon: '👥' },
      { label: 'Go to Contact', action: '#contact', icon: '📧' },
      { label: 'Toggle Dark Mode', action: 'theme', icon: '🌙' },
      { label: 'Change Language', action: 'lang', icon: '🌐' },
      { label: 'Back to Top', action: 'top', icon: '⬆️' },
    ];
  }

  #bindEvents() {
    // Toggle via store subscription
    store.subscribe('commandOpen', (open) => {
      this.classList.toggle('open', open);
      if (open) {
        this.input?.focus();
        this.#filter();
        a11y.announce('Command palette opened');
      }
    });

    this.on(this.overlay, 'click', () => store.set('commandOpen', false));
    this.on(this.input, 'input', () => this.#filter());
    this.on(this.input, 'keydown', (e) => {
      if (e.key === 'Escape') store.set('commandOpen', false);
      if (e.key === 'Enter') {
        const active = this.$('.command-item.active') || this.$('.command-item');
        if (active) active.click();
      }
      if (e.key === 'ArrowDown') this.#move(1);
      if (e.key === 'ArrowUp') this.#move(-1);
    });
  }

  #filter() {
    const q = this.input?.value?.toLowerCase() || '';
    const filtered = this.actions.filter(a =>
      a.label.toLowerCase().includes(q) || a.action.toLowerCase().includes(q)
    );
    this.#render(filtered);
  }

  #render(items) {
    this.results.innerHTML = '';
    items.forEach((item, i) => {
      const el = document.createElement('button');
      el.className = `command-item ${i === 0 ? 'active' : ''}`;
      el.innerHTML = `<span class="cmd-icon">${item.icon}</span><span>${item.label}</span>`;
      el.setAttribute('role', 'option');
      el.setAttribute('aria-selected', String(i === 0));
      this.on(el, 'click', () => this.#execute(item));
      this.on(el, 'mouseenter', () => {
        this.$$('.command-item').forEach(e => e.classList.remove('active'));
        el.classList.add('active');
      });
      this.results.appendChild(el);
    });
    this.results.style.display = items.length ? 'block' : 'none';
  }

  #execute(item) {
    store.set('commandOpen', false);
    if (item.action === 'theme') {
      document.getElementById('themeToggle')?.click();
    } else if (item.action === 'lang') {
      document.getElementById('langBtn')?.click();
    } else if (item.action === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item.action.startsWith('#')) {
      const el = document.querySelector(item.action);
      if (el) {
        if (window.lenis) window.lenis.scrollTo(el, { duration: 1.2 });
        else el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  #move(dir) {
    const items = this.$$('.command-item');
    const idx = items.findIndex(e => e.classList.contains('active'));
    items.forEach(e => e.classList.remove('active'));
    const next = (idx + dir + items.length) % items.length;
    items[next]?.classList.add('active');
    items[next]?.scrollIntoView({ block: 'nearest' });
  }
}

BaseComponent.define('command-palette', CommandPalette);
