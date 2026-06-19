/* Component: Hero Section */
import { BaseComponent } from './BaseComponent.js';
import { morphLogo } from '../animations/morphLogo.js';
import { textSplitter } from '../animations/textSplit.js';
import { revealEngine } from '../animations/reveal.js';

export class HeroSection extends BaseComponent {
  mount() {
    this.heroTitle = this.$('#heroTitle');
    this.canvas3d = this.$('#hero3dCanvas');

    this.#initParticles();
    revealEngine.observe(this);
    if (this.heroTitle) textSplitter.split(this.heroTitle, { type: 'chars', stagger: 20 });
  }

  #initParticles() {
    if (!this.canvas3d || typeof THREE === 'undefined') return;
    try {
      const w = this.canvas3d.parentElement.clientWidth || 400;
      const h = this.canvas3d.parentElement.clientHeight || 400;
      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
      cam.position.z = 18;
      const renderer = new THREE.WebGLRenderer({ canvas: this.canvas3d, alpha: true, antialias: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const graphGroup = new THREE.Group();
      const nodes = [];
      const nodeMat = new THREE.MeshBasicMaterial({ color: 0xB83A3A, transparent: true, opacity: 0.7 });
      const edgeMat = new THREE.LineBasicMaterial({ color: 0xA31F34, transparent: true, opacity: 0.15 });

      for (let i = 0; i < 40; i++) {
        const r = 3 + Math.random() * 3.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const v = new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta)
        );
        nodes.push(v);
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.12 + Math.random() * 0.15, 6, 6), nodeMat);
        sphere.position.copy(v);
        graphGroup.add(sphere);
      }

      for (let i = 0; i < 40; i++) {
        for (let j = i + 1; j < 40; j++) {
          const d = nodes[i].distanceTo(nodes[j]);
          if (d < 3.5) {
            const g = new THREE.BufferGeometry().setFromPoints([nodes[i], nodes[j]]);
            graphGroup.add(new THREE.Line(g, edgeMat));
          }
        }
      }
      scene.add(graphGroup);

      const gp = new THREE.BufferGeometry();
      const pc = 400;
      const pos = new Float32Array(pc * 3);
      for (let i = 0; i < pc; i++) {
        const r = 5 + Math.random() * 4;
        const t = Math.random() * Math.PI * 2;
        const p = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(p) * Math.cos(t);
        pos[i * 3 + 1] = r * Math.cos(p);
        pos[i * 3 + 2] = r * Math.sin(p) * Math.sin(t);
      }
      gp.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const pm = new THREE.PointsMaterial({ color: 0xB83A3A, size: 0.08, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
      const pts = new THREE.Points(gp, pm);
      scene.add(pts);

      const al = new THREE.AmbientLight(0x2A0808, 0.3);
      scene.add(al);
      const dl = new THREE.DirectionalLight(0xA31F34, 0.6);
      dl.position.set(5, 10, 7);
      scene.add(dl);

      let mx = 0, my = 0;
      document.addEventListener('mousemove', (e) => {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;
        my = -(e.clientY / window.innerHeight - 0.5) * 2;
      });

      const anim = () => {
        requestAnimationFrame(anim);
        graphGroup.rotation.x += 0.003;
        graphGroup.rotation.y += 0.006;
        pts.rotation.x += 0.001;
        pts.rotation.y += 0.002;
        graphGroup.position.x += (mx * 2 - graphGroup.position.x) * 0.03;
        graphGroup.position.y += (my * 2 - graphGroup.position.y) * 0.03;
        renderer.render(scene, cam);
      };
      anim();
    } catch (e) { /* silent */ }
  }
}

BaseComponent.define('hero-section', HeroSection);
