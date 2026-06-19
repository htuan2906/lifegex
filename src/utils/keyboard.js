/* Task 30: Full Keyboard Navigation */
import { store } from '../state/store.js';
import { historyStack } from '../state/history.js';

class KeyboardManager {
  #bindings = new Map();
  #active = true;

  constructor() {
    this.#bind();
  }

  #bind() {
    document.addEventListener('keydown', (e) => {
      if (!this.#active) return;
      const key = this.#normalize(e);
      const handlers = this.#bindings.get(key);
      if (handlers) {
        for (const h of handlers) {
          if (h.when ? h.when() : true) {
            e.preventDefault();
            h.fn(e);
            break;
          }
        }
      }
      this.#handleBuiltin(e);
    });
  }

  #normalize(e) {
    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push('Cmd');
    if (e.shiftKey) parts.push('Shift');
    if (e.altKey) parts.push('Alt');
    const k = e.key === ' ' ? 'Space' : e.key;
    parts.push(k.length === 1 ? k.toUpperCase() : k);
    return parts.join('+');
  }

  #handleBuiltin(e) {
    if (e.key === 'Escape') {
      if (store.get('commandOpen')) {
        store.set('commandOpen', false);
      } else if (store.get('menuOpen')) {
        store.set('menuOpen', false);
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      store.set('commandOpen', !store.get('commandOpen'));
    }
    if (e.altKey && e.key === 'ArrowLeft') {
      e.preventDefault();
      historyStack.back();
    }
    if (e.altKey && e.key === 'ArrowRight') {
      e.preventDefault();
      historyStack.forward();
    }
  }

  register(shortcut, fn, when) {
    if (!this.#bindings.has(shortcut)) this.#bindings.set(shortcut, []);
    this.#bindings.get(shortcut).push({ fn, when });
  }

  unregister(shortcut) {
    this.#bindings.delete(shortcut);
  }

  pause() { this.#active = false; }
  resume() { this.#active = true; }
}

export const keyboard = new KeyboardManager();
