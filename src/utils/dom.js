/* DOM Helpers */
export const $ = (s, ctx = document) => ctx.querySelector(s);
export const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

export function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith('on')) {
      e.addEventListener(k.slice(2), v);
    } else if (k === 'style' && typeof v === 'object') {
      Object.assign(e.style, v);
    } else if (k === 'dataset') {
      Object.assign(e.dataset, v);
    } else if (k === 'className') {
      e.className = v;
    } else {
      e.setAttribute(k, v);
    }
  }
  for (const c of children) {
    if (typeof c === 'string') e.appendChild(document.createTextNode(c));
    else if (c instanceof Node) e.appendChild(c);
  }
  return e;
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function mapRange(val, inMin, inMax, outMin, outMax) {
  return ((val - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

export function debounce(fn, ms = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function throttle(fn, ms = 100) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn(...args); }
  };
}

export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve(s);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
