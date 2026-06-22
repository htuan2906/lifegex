/* Task 15: Text Splitting Reveal Engine */
import { observerPool } from '../utils/observer.js';
import { config } from '../utils/config.js';

class TextSplitter {
  constructor() {
    observerPool.create('textsplit', { threshold: 0.1, once: true });
  }

  split(el, { type = 'chars', stagger = 30 } = {}) {
    if (!config.features.textSplit) return;
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';

    const translatedChildren = type === 'chars'
      ? Array.from(el.querySelectorAll('[data-i18n]'))
      : [];

    if (translatedChildren.length > 0) {
      let offset = 0;
      translatedChildren.forEach((child) => {
        if (child.classList.contains('gradient-text')) return;
        offset = this.#splitText(child, 'chars', stagger, offset);
      });
    } else {
      this.#splitText(el, type, stagger);
    }

    observerPool.observe('textsplit', el, (entry) => {
      if (entry.isIntersecting) {
        el.querySelectorAll('.char-reveal, .word-reveal').forEach(s => {
          s.classList.add('visible');
        });
      }
    });
  }

  #splitText(el, type, stagger, offset = 0) {
    const text = el.textContent.trim();
    if (!text) return offset;

    el.textContent = '';
    const wrapper = document.createElement('span');
    wrapper.style.display = 'inline-block';

    if (type === 'chars') {
      for (let i = 0; i < text.length; i++) {
        const char = document.createElement('span');
        char.textContent = text[i] === ' ' ? '\u00A0' : text[i];
        char.className = 'char-reveal';
        char.style.transitionDelay = `${(offset + i) * stagger}ms`;
        wrapper.appendChild(char);
      }
      offset += text.length;
    } else {
      const words = text.split(' ');
      for (let i = 0; i < words.length; i++) {
        const word = document.createElement('span');
        word.textContent = words[i];
        word.className = 'word-reveal';
        word.style.transitionDelay = `${(offset + i) * stagger}ms`;
        wrapper.appendChild(word);
        if (i < words.length - 1) wrapper.appendChild(document.createTextNode('\u00A0'));
      }
      offset += words.length;
    }

    el.appendChild(wrapper);
    return offset;
  }

  splitAll(root, opts = {}) {
    root.querySelectorAll('[data-split]').forEach(el => {
      this.split(el, { type: el.dataset.split, ...opts });
    });
  }
}

export const textSplitter = new TextSplitter();
