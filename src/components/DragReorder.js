/* Task 41: Drag-to-Reorder Dashboard */
import { BaseComponent } from './BaseComponent.js';
import { config } from '../utils/config.js';

export class DragReorder extends BaseComponent {
  mount() {
    if (!config.features.dragReorder) return;
    this.container = this.$('.drag-container');
    if (!this.container) return;
    this.#init();
  }

  #init() {
    const items = this.$$('.drag-item');
    let dragEl = null, clone = null;
    let startX, startY, offsetX, offsetY, origIdx;

    const onStart = (e) => {
      const t = e.target.closest('.drag-item');
      if (!t) return;
      dragEl = t;
      origIdx = Array.from(items).indexOf(dragEl);
      const rect = dragEl.getBoundingClientRect();
      startX = (e.touches?.[0]?.clientX || e.clientX);
      startY = (e.touches?.[0]?.clientY || e.clientY);
      offsetX = startX - rect.left;
      offsetY = startY - rect.top;

      clone = dragEl.cloneNode(true);
      clone.style.cssText = `
        position: fixed; z-index: 9999; pointer-events: none;
        width: ${rect.width}px; left: ${startX - offsetX}px; top: ${startY - offsetY}px;
        opacity: 0.9; transform: rotate(2deg) scale(1.03);
        transition: none;
      `;
      document.body.appendChild(clone);
      dragEl.style.opacity = '0.3';
    };

    const onMove = (e) => {
      if (!clone) return;
      e.preventDefault();
      const cx = (e.touches?.[0]?.clientX || e.clientX) - offsetX;
      const cy = (e.touches?.[0]?.clientY || e.clientY) - offsetY;
      clone.style.left = `${cx}px`;
      clone.style.top = `${cy}px`;
    };

    const onEnd = () => {
      if (!clone) return;
      clone.remove();
      clone = null;
      if (dragEl) dragEl.style.opacity = '1';
      dragEl = null;
      this.#saveOrder();
    };

    this.container.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    this.container.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);

    this._handlers.push(() => {
      this.container.removeEventListener('mousedown', onStart);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
    });
  }

  #saveOrder() {
    const order = [];
    this.$$('.drag-item').forEach(el => order.push(el.dataset.id));
    try {
      localStorage.setItem('lgx-drag-order', JSON.stringify(order));
    } catch {}
  }

  restoreOrder() {
    try {
      const order = JSON.parse(localStorage.getItem('lgx-drag-order'));
      if (!order) return;
      const items = this.$$('.drag-item');
      const parent = this.container;
      order.forEach(id => {
        const el = items.find(i => i.dataset.id === id);
        if (el) parent.appendChild(el);
      });
    } catch {}
  }
}

BaseComponent.define('drag-reorder', DragReorder);
