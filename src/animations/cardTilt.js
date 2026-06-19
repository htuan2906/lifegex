/* Task 17: 3D Card Tilt + Gyroscope Support */
import { config } from '../utils/config.js';

class CardTilt {
  #cards = [];

  init(root = document) {
    if (config.features.reducedMotion) return;
    this.#cards = root.querySelectorAll('.tilt-card');
    this.#cards.forEach(card => this.#enable(card));
    if (matchMedia('(pointer: coarse)').matches && window.DeviceOrientationEvent) {
      this.#enableGyroscope();
    }
  }

  #enable(card) {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const tiltX = (y - 0.5) * -12;
      const tiltY = (x - 0.5) * 12;

      card.style.transform = `
        perspective(800px)
        rotateX(${tiltX}deg)
        rotateY(${tiltY}deg)
        scale3d(1.02, 1.02, 1.02)
      `;

      const glow = card.querySelector('.tilt-glow');
      if (glow) {
        glow.style.background = `
          radial-gradient(
            circle at ${x * 100}% ${y * 100}%,
            rgba(163, 31, 52, 0.08),
            transparent 60%
          )
        `;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
  }

  #enableGyroscope() {
    window.addEventListener('deviceorientation', (e) => {
      const tiltX = (e.beta || 0) * 0.1;
      const tiltY = (e.gamma || 0) * 0.1;
      this.#cards.forEach(card => {
        card.style.transform = `
          perspective(800px)
          rotateX(${tiltX}deg)
          rotateY(${tiltY}deg)
        `;
      });
    }, true);
  }

  destroy() {
    this.#cards.forEach(card => card.style.transform = '');
    this.#cards = [];
  }
}

export const cardTilt = new CardTilt();
