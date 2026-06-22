/* Task 29-30: i18n Engine + Machine Translation Fallback (Task 34) */
import { config } from './config.js';
import { store } from '../state/store.js';
import { urlSync } from './url.js';

class I18nEngine {
  #locale = 'en';
  #translations = new Map();
  #fallbacks = new Map();
  #loaded = new Set();
  #listeners = new Map();
  #pending = new Map();
  #observer = null;

  constructor() {
    try {
      this.#locale = localStorage.getItem(config.storage.locale) || 'en';
    } catch {
      this.#locale = 'en';
    }
    store.set('lang', this.#locale);
  }

  get locale() { return this.#locale; }

  async init() {
    await this.#loadLocale(this.#locale);
    document.documentElement.lang = this.#locale;
    this.#applyTranslations();
    this.#observeDynamic();
  }

  async setLocale(locale) {
    if (locale === this.#locale) return;
    const prev = this.#locale;
    this.#locale = locale;
    try { localStorage.setItem(config.storage.locale, locale); } catch {}
    document.documentElement.lang = locale;
    if (!this.#loaded.has(locale)) await this.#loadLocale(locale);
    this.#applyTranslations();
    try { urlSync.set('lang', locale); } catch {}
    this.#emit('change', { locale, prev });
  }

  async #loadLocale(locale) {
    if (this.#loaded.has(locale) || this.#pending.has(locale)) return;
    this.#pending.set(locale, true);
    try {
      const mod = await import(`../i18n/${locale}.json`);
      this.#translations.set(locale, mod.default || mod);
      this.#loaded.add(locale);
    } catch {
      console.warn(`[i18n] ${locale} not found, trying fallback`);
      // Task 34: Machine translation fallback
      if (config.api.translation) {
        try {
          const res = await fetch(config.api.translation, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-API-Key': config.api.translationKey },
            body: JSON.stringify({ from: 'en', to: locale, text: Array.from(this.#fallbacks.keys()) }),
          });
          if (res.ok) {
            const data = await res.json();
            const map = {};
            this.#fallbacks.forEach((v, k) => { map[k] = data.translations?.[k] || v; });
            this.#translations.set(locale, map);
          }
        } catch { /* silent */ }
      }
      if (!this.#translations.has(locale)) {
        this.#translations.set(locale, {});
      }
      this.#loaded.add(locale);
    } finally {
      this.#pending.delete(locale);
    }
  }

  t(key, params = {}) {
    let val = this.#translations.get(this.#locale)?.[key];
    if (!val) val = this.#fallbacks.get(key) || this.#translations.get('en')?.[key] || key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        val = val.replace(`{${k}}`, v);
      }
    }
    return val;
  }

  #applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (!this.#fallbacks.has(key)) this.#fallbacks.set(key, el.textContent);
      el.textContent = this.t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = this.t(el.dataset.i18nPlaceholder);
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
      el.alt = this.t(el.dataset.i18nAlt);
    });
  }

  #observeDynamic() {
    this.#observer = new MutationObserver(() => this.#applyTranslations());
    this.#observer.observe(document.body, { childList: true, subtree: true });
  }

  destroy() {
    if (this.#observer) this.#observer.disconnect();
    this.#observer = null;
  }

  on(event, handler) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, new Set());
    this.#listeners.get(event).add(handler);
    return () => this.#listeners.get(event)?.delete(handler);
  }

  #emit(event, data) {
    const handlers = this.#listeners.get(event);
    if (handlers) queueMicrotask(() => {
      for (const h of handlers) h(data);
    });
  }
}

export const i18n = new I18nEngine();
