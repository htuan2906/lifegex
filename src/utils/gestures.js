/* Task 33: Touch Gesture System */
export class GestureEngine {
  #handlers = new Map();
  #active = new Map();

  constructor(el) {
    this.el = el;
    this.#bindEvents();
  }

  on(gesture, handler) {
    if (!this.#handlers.has(gesture)) this.#handlers.set(gesture, new Set());
    this.#handlers.get(gesture).add(handler);
    return () => this.#handlers.get(gesture)?.delete(handler);
  }

  #bindEvents() {
    let startX, startY, startT, startDist;
    const isTouch = matchMedia('(pointer: coarse)').matches;

    const onStart = (e) => {
      const t = e.touches?.[0] || e;
      startX = t.clientX;
      startY = t.clientY;
      startT = Date.now();
      if (e.touches?.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        startDist = Math.hypot(dx, dy);
      }
      this.#emit('swipestart', { x: startX, y: startY });
    };

    const onMove = (e) => {
      if (e.cancelable && e.touches) e.preventDefault();
      const t = e.touches?.[0] || e;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      const dist = Math.hypot(dx, dy);
      if (dist > 10) {
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        this.#emit('swipe', { dx, dy, dist, angle, x: t.clientX, y: t.clientY });
      }
      if (e.touches?.length === 2) {
        const dx2 = e.touches[0].clientX - e.touches[1].clientX;
        const dy2 = e.touches[0].clientY - e.touches[1].clientY;
        const dist2 = Math.hypot(dx2, dy2);
        this.#emit('pinch', { scale: dist2 / startDist });
      }
    };

    const onEnd = (e) => {
      const dt = Date.now() - startT;
      const t = e.changedTouches?.[0] || e;
      const dx = (t?.clientX || startX) - startX;
      const dy = (t?.clientY || startY) - startY;
      const dist = Math.hypot(dx, dy);
      const isFast = dt < 300 && dist > 30;
      if (isFast) {
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        if (Math.abs(angle) > 30) {
          if (angle > 0) this.#emit('swipedown');
          else this.#emit('swipeup');
        } else {
          if (dx > 0) this.#emit('swiperight');
          else this.#emit('swipeleft');
        }
      }
      if (dist < 10 && dt < 300) this.#emit('tap', { x: startX, y: startY });
      if (dist < 10 && dt > 500) this.#emit('longpress', { x: startX, y: startY });
      this.#emit('swipeend', { dx, dy, dist, dt });
    };

    if (isTouch) {
      this.el.addEventListener('touchstart', onStart, { passive: true });
      this.el.addEventListener('touchmove', onMove, { passive: false });
      this.el.addEventListener('touchend', onEnd);
    } else {
      this.el.addEventListener('mousedown', onStart);
      this.el.addEventListener('mousemove', onMove);
      this.el.addEventListener('mouseup', onEnd);
    }
  }

  #emit(event, data) {
    const handlers = this.#handlers.get(event);
    if (handlers) for (const h of handlers) h(data);
  }

  destroy() {
    this.#handlers.clear();
  }
}
