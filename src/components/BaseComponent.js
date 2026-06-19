/* Task 35-37: Base Web Component with lifecycle, registry, and lazy loading */
export class BaseComponent extends HTMLElement {
  static registry = new Map();

  static define(name, cls) {
    if (!customElements.get(name)) {
      customElements.define(name, cls);
      BaseComponent.registry.set(name, cls);
    }
  }

  static async lazyLoad(name, modulePath, tagName) {
    if (customElements.get(tagName)) return;
    try {
      const mod = await import(modulePath);
      BaseComponent.define(tagName, mod.default || Object.values(mod)[0]);
    } catch (e) {
      console.warn(`[Component] Failed to load ${name}`, e);
    }
  }

  constructor() {
    super();
    this._mounted = false;
    this._handlers = [];
  }

  connectedCallback() {
    if (this._mounted) return;
    this._mounted = true;
    this.mount();
  }

  disconnectedCallback() {
    this._handlers.forEach(h => h());
    this._handlers = [];
    this.destroy();
  }

  adoptedCallback() {
    this.mount();
  }

  attributeChangedCallback(name, old, val) {
    if (old !== val) this.update(name, val);
  }

  $(sel) { return this.querySelector(sel); }
  $$(sel) { return Array.from(this.querySelectorAll(sel)); }

  on(el, evt, fn) {
    el.addEventListener(evt, fn);
    this._handlers.push(() => el.removeEventListener(evt, fn));
  }

  emit(name, detail) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  mount() { /* override */ }
  destroy() { /* override */ }
  update(name, val) { /* override */ }
}

/* Task 37: Dynamic Component Registry (config-driven) */
export class ComponentRegistry {
  #components = new Map();

  register(name, factory, opts = {}) {
    this.#components.set(name, { factory, opts });
  }

  async render(name, target, props = {}) {
    const entry = this.#components.get(name);
    if (!entry) throw new Error(`Component "${name}" not registered`);
    const el = await entry.factory(props);
    if (typeof el === 'string') {
      target.innerHTML = el;
    } else if (el instanceof Node) {
      target.appendChild(el);
    }
    return el;
  }

  async renderAll(target, filter) {
    for (const [name, entry] of this.#components) {
      if (filter && !filter(name)) continue;
      if (entry.opts.lazy) continue;
      await this.render(name, target);
    }
  }
}

export const componentRegistry = new ComponentRegistry();
