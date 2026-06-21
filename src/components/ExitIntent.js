/* Task 44: Exit Intent Modal */
import { BaseComponent } from './BaseComponent.js';
import { a11y } from '../utils/a11y.js';

export class ExitIntent extends BaseComponent {
  #unfocus = null;

  mount() {
    this.overlay = this.$('.exit-overlay');
    this.modal = this.$('.exit-modal');
    this.closeBtn = this.$('.exit-close');
    this.triggers = 0;
    this.maxTriggers = 3;

    this.#bind();
  }

  #bind() {
    let showTimer = null;

    const onLeave = (e) => {
      if (e.clientY > 0 || this.triggers >= this.maxTriggers) return;
      if (showTimer) return;
      showTimer = setTimeout(() => {
        this.#show();
        showTimer = null;
      }, 200);
    };

    document.addEventListener('mouseleave', onLeave);
    this._handlers.push(() => document.removeEventListener('mouseleave', onLeave));

    this.on(this.closeBtn, 'click', () => this.#hide());
    this.on(this.overlay, 'click', (e) => {
      if (e.target === this.overlay) this.#hide();
    });
    this.on(this, 'click', (e) => {
      if (e.target.classList.contains('exit-cta')) {
        this.#hide();
        const target = document.querySelector('#contact');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }
    });

    this._keyHandler = (e) => { if (e.key === 'Escape') this.#hide(); };
    document.addEventListener('keydown', this._keyHandler);
    this._handlers.push(() => document.removeEventListener('keydown', this._keyHandler));
  }

  #show() {
    this.triggers++;
    this.overlay.style.display = 'flex';
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-modal', 'true');
    this.overlay.setAttribute('aria-label', 'Stay Connected');
    requestAnimationFrame(() => {
      this.overlay.style.opacity = '1';
      this.modal.style.transform = 'translateY(0)';
      this.modal.style.opacity = '1';
    });
    this.#unfocus = a11y.trapFocus(this.overlay);
    a11y.announce('Exit intent dialog opened');
  }

  #hide() {
    if (this.#unfocus) this.#unfocus();
    this.#unfocus = null;
    this.overlay.style.opacity = '0';
    this.modal.style.transform = 'translateY(20px)';
    this.modal.style.opacity = '0';
    setTimeout(() => { this.overlay.style.display = 'none'; }, 400);
  }
}

BaseComponent.define('exit-intent', ExitIntent);
