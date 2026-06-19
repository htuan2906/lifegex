/* Task 15: Text Splitting Reveal Engine */
import { observerPool } from '../utils/observer.js';
import { config } from '../utils/config.js';

class TextSplitter {
  constructor() {
    if (!config.features.textSplit) return;
    observerPool.create('textsplit', { threshold: 0.1, once: true });
  }

  split(el, { type = 'chars', stagger = 30 } = {}) {
    if (!config.features.textSplit) return;
    const text = el.textContent.trim();
    if (!text) return;

    el.textContent = '';
    const wrapper = document.createElement('span');
    wrapper.style.display = 'inline-block';

    if (type === 'chars') {
      for (let i = 0; i < text.length; i++) {
        const c = document.createElement('span');
        c.textContent = text[i] === ' ' ? '\u00A0' : text[i];
        c.className = 'char-reveal';
        c.style.transitionDelay = `${i * stagger}ms`;
        wrapper.appendChild(c);
      }
    } else {
      const words = text.split(' ');
      for (let i = 0; i < words.length; i++) {
        const w = document.createElement('span');
        w.textContent = words[i];
        w.className = 'word-reveal';
        w.style.transitionDelay = `${i * stagger}ms`;
        wrapper.appendChild(w);
        if (i < words.length - 1) {
          wrapper.appendChild(document.createTextNode('\u00A0'));
        }
      }
    }

    el.appendChild(wrapper);
    observerPool.observe('textsplit', el, (entry) => {
      if (entry.isIntersecting) {
        el.querySelectorAll('.char-reveal, .word-reveal').forEach(s => {
          s.classList.add('visible');
        });
      }
    });
  }

  splitAll(root, opts = {}) {
    root.querySelectorAll('[data-split]').forEach(el => {
      this.split(el, { type: el.dataset.split, ...opts });
    });
  }
}

export const textSplitter = new TextSplitter();
