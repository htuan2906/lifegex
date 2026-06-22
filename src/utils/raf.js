const callbacks = new Set();
let running = false;

function loop(time) {
  for (const cb of callbacks) cb(time);
  if (running) requestAnimationFrame(loop);
}

export const sharedRAF = {
  add(fn) {
    callbacks.add(fn);
    if (!running) {
      running = true;
      requestAnimationFrame(loop);
    }
  },
  remove(fn) {
    callbacks.delete(fn);
    if (callbacks.size === 0) running = false;
  },
  stop() {
    running = false;
    callbacks.clear();
  },
};
