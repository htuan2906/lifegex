/* Component: Funds (progress bars + sunburst chart) */
import { BaseComponent } from './BaseComponent.js';

export class FundsSection extends BaseComponent {
  mount() {
    this.#animateBars();
  }

  #animateBars() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const bars = en.target.querySelectorAll('.funds-bar-fill');
          bars.forEach(b => {
            const w = b.style.width;
            b.style.transition = 'width 1.2s cubic-bezier(.16,1,.3,1)';
            b.style.width = '0%';
            requestAnimationFrame(() => requestAnimationFrame(() => { b.style.width = w; }));
          });
        }
      });
    }, { threshold: 0.3 });

    const grid = this.$('.funds-grid');
    if (grid) obs.observe(grid);
  }
}

BaseComponent.define('funds-section', FundsSection);

/* Task 45: Sunburst Chart Component */
export class SunburstChart extends BaseComponent {
  mount() {
    const canvas = this.$('canvas');
    if (!canvas || !canvas.dataset.values) return;
    const values = JSON.parse(canvas.dataset.values);
    this.#draw(canvas, values);
  }

  #draw(canvas, values) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.clientWidth * window.devicePixelRatio;
    const H = canvas.height = canvas.clientHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const w = canvas.clientWidth, h = canvas.clientHeight;

    const cx = w / 2, cy = h / 2;
    const maxR = Math.min(w, h) / 2 - 10;
    const total = values.reduce((s, v) => s + v.value, 0);
    let startAngle = -Math.PI / 2;

    const colors = ['#A31F34', '#C94B4B', '#7B1618', '#B83A3A', '#8B2020'];

    values.forEach((v, i) => {
      const angle = (v.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, startAngle, startAngle + angle);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();

      // Inner ring
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR * 0.6, startAngle, startAngle + angle);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fill();

      // Label
      const midAngle = startAngle + angle / 2;
      const labelR = maxR * 0.8;
      ctx.save();
      ctx.translate(cx + Math.cos(midAngle) * labelR, cy + Math.sin(midAngle) * labelR);
      ctx.rotate(midAngle > Math.PI / 2 && midAngle < Math.PI * 1.5 ? midAngle + Math.PI : midAngle);
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${12 * devicePixelRatio}px "Be Vietnam Pro"`;
      ctx.textAlign = 'center';
      ctx.fillText(`${v.label} ${Math.round(v.value / total * 100)}%`, 0, 0);
      ctx.restore();

      startAngle += angle;
    });
  }
}

BaseComponent.define('sunburst-chart', SunburstChart);
