/* Task 44: Exit Intent Modal */
import { BaseComponent } from './BaseComponent.js';

export class ExitIntent extends BaseComponent {
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
    this.on(this, 'click', '.exit-cta', () => {
      this.#hide();
      const target = document.querySelector('#contact');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  #show() {
    this.triggers++;
    this.overlay.style.display = 'flex';
    requestAnimationFrame(() => {
      this.overlay.style.opacity = '1';
      this.modal.style.transform = 'translateY(0)';
      this.modal.style.opacity = '1';
    });
  }

  #hide() {
    this.overlay.style.opacity = '0';
    this.modal.style.transform = 'translateY(20px)';
    this.modal.style.opacity = '0';
    setTimeout(() => { this.overlay.style.display = 'none'; }, 400);
  }
}

BaseComponent.define('exit-intent', ExitIntent);
